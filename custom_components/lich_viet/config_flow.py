"""Config flow for the Vietnamese Lunar Calendar integration."""

from __future__ import annotations

from datetime import date
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

from .amlich_core import get_lunar_month_length, get_year_info
from .const import DOMAIN
from .su_kien import REPEATS, normalize_repeat


def _day_selector() -> selector.NumberSelector:
    """Return a day number selector."""
    return selector.NumberSelector(
        selector.NumberSelectorConfig(
            min=1,
            max=31,
            step=1,
            mode=selector.NumberSelectorMode.BOX,
        )
    )


def _month_selector() -> selector.NumberSelector:
    """Return a month number selector."""
    return selector.NumberSelector(
        selector.NumberSelectorConfig(
            min=1,
            max=12,
            step=1,
            mode=selector.NumberSelectorMode.BOX,
        )
    )


def _year_selector() -> selector.NumberSelector:
    """Return a year selector calculated when the form is opened."""
    return selector.NumberSelector(
        selector.NumberSelectorConfig(
            min=1800,
            max=2199,
            step=1,
            mode=selector.NumberSelectorMode.BOX,
        )
    )


def _event_name_selector() -> selector.TextSelector:
    return selector.TextSelector(selector.TextSelectorConfig())


def _description_selector() -> selector.TextSelector:
    return selector.TextSelector(
        selector.TextSelectorConfig(
            multiline=True,
            type=selector.TextSelectorType.TEXT,
        )
    )


def _optional_key(name: str, value: Any) -> Any:
    """Create an optional schema key with a suggested current value."""
    if value in (None, "", "none"):
        return vol.Optional(name)
    return vol.Optional(name, description={"suggested_value": int(value)})


def _normalise_input(user_input: dict[str, Any]) -> dict[str, Any]:
    """Convert selector values to integers and remove empty optional values."""
    result = dict(user_input)
    for text_key in ("event_name", "event_description"):
        if isinstance(result.get(text_key), str):
            result[text_key] = result[text_key].strip()

    for key in (
        "event_day",
        "event_month",
        "event_year",
        "birth_day",
        "birth_month",
        "birth_year",
    ):
        value = result.get(key)
        if value in (None, "", "none"):
            result.pop(key, None)
            continue
        try:
            result[key] = int(value)
        except (TypeError, ValueError):
            result.pop(key, None)
    return result


def _validate_solar_event(data: dict[str, Any]) -> str | None:
    """Validate a recurring solar event date."""
    if not data.get("event_name"):
        return "event_name_required"

    day = int(data.get("event_day", 0))
    month = int(data.get("event_month", 0))
    year = data.get("event_year")
    validation_year = int(year) if year else 2000
    try:
        date(validation_year, month, day)
    except ValueError:
        return "invalid_solar_date"
    return None


def _validate_lunar_event(data: dict[str, Any]) -> str | None:
    """Validate a recurring lunar event date."""
    if not data.get("event_name"):
        return "event_name_required"

    day = int(data.get("event_day", 0))
    month = int(data.get("event_month", 0))
    if day < 1 or day > 30 or month < 1 or month > 12:
        return "invalid_lunar_date"

    year = data.get("event_year")
    if not year:
        return None

    try:
        year_info = get_year_info(int(year))
    except ValueError:
        return "invalid_lunar_date"

    for month_info in year_info:
        if month_info.month != month or month_info.leap != 0:
            continue
        month_length = get_lunar_month_length(month_info)
        return None if day <= month_length else "invalid_lunar_date"

    return "invalid_lunar_date"


def _get_legacy_event_date(entry: config_entries.ConfigEntry) -> tuple[Any, Any]:
    """Read the event date used by older integration versions."""
    old_date = entry.options.get(
        "event_date", entry.data.get("event_date", "1/1")
    )
    try:
        parts = old_date.replace("-", "/").split("/")
        return int(parts[0]), int(parts[1])
    except (AttributeError, IndexError, TypeError, ValueError):
        return 1, 1


def _event_schema(
    *,
    event_type: str,
    current: dict[str, Any] | None = None,
) -> vol.Schema:
    """Build a translated event form using public Home Assistant selectors."""
    values = current or {}
    schema: dict[Any, Any] = {
        vol.Required(
            "event_name",
            description={"suggested_value": values.get("event_name", "")},
        ): _event_name_selector(),
        vol.Required(
            "event_day",
            description={
                "suggested_value": int(
                    values.get("event_day", 15 if event_type == "lunar" else 1)
                )
            },
        ): _day_selector(),
        vol.Required(
            "event_month",
            description={
                "suggested_value": int(
                    values.get("event_month", 8 if event_type == "lunar" else 1)
                )
            },
        ): _month_selector(),
        vol.Required(
            "event_repeat",
            default=normalize_repeat(values.get("event_repeat")),
        ): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=list(REPEATS),
                translation_key="event_repeat",
                mode=selector.SelectSelectorMode.DROPDOWN,
            )
        ),
        _optional_key("event_year", values.get("event_year")): _year_selector(),
    }

    if event_type == "lunar":
        schema.update(
            {
                _optional_key("birth_day", values.get("birth_day")): _day_selector(),
                _optional_key("birth_month", values.get("birth_month")): _month_selector(),
                _optional_key("birth_year", values.get("birth_year")): _year_selector(),
            }
        )

    description_key = vol.Optional(
        "event_description",
        description={"suggested_value": values.get("event_description", "")},
    )
    schema[description_key] = _description_selector()
    return vol.Schema(schema)


class AmLichOptionsFlowHandler(config_entries.OptionsFlowWithReload):
    """Edit an existing calendar or event entry."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ):
        """Handle options for the selected entry."""
        is_main = self.config_entry.data.get(
            "is_main", self.config_entry.data.get("event_name") is None
        )
        if is_main:
            if user_input is not None:
                return self.async_create_entry(title="", data={})
            return self.async_show_form(step_id="init", data_schema=vol.Schema({}))

        event_type = self.config_entry.options.get(
            "event_type", self.config_entry.data.get("event_type", "lunar")
        )
        errors: dict[str, str] = {}

        if user_input is not None:
            normalised = _normalise_input(user_input)
            error = (
                _validate_lunar_event(normalised)
                if event_type == "lunar"
                else _validate_solar_event(normalised)
            )
            if error is None:
                return self.async_create_entry(title="", data=normalised)
            errors["base"] = error

        current_day = self.config_entry.options.get(
            "event_day", self.config_entry.data.get("event_day")
        )
        current_month = self.config_entry.options.get(
            "event_month", self.config_entry.data.get("event_month")
        )
        if current_day is None or current_month is None:
            current_day, current_month = _get_legacy_event_date(self.config_entry)

        values = {
            "event_name": self.config_entry.options.get(
                "event_name",
                self.config_entry.data.get(
                    "event_name", self.config_entry.title or "Sự kiện"
                ),
            ),
            "event_day": current_day,
            "event_month": current_month,
            "event_repeat": self.config_entry.options.get(
                "event_repeat", self.config_entry.data.get("event_repeat")
            ),
            "event_year": self.config_entry.options.get(
                "event_year", self.config_entry.data.get("event_year")
            ),
            "event_description": self.config_entry.options.get(
                "event_description",
                self.config_entry.data.get("event_description", ""),
            ),
            "birth_day": self.config_entry.options.get(
                "birth_day", self.config_entry.data.get("birth_day")
            ),
            "birth_month": self.config_entry.options.get(
                "birth_month", self.config_entry.data.get("birth_month")
            ),
            "birth_year": self.config_entry.options.get(
                "birth_year", self.config_entry.data.get("birth_year")
            ),
        }
        return self.async_show_form(
            step_id="init",
            data_schema=_event_schema(event_type=event_type, current=values),
            errors=errors,
        )


class AmLichConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Configure the Vietnamese Lunar Calendar integration."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> AmLichOptionsFlowHandler:
        return AmLichOptionsFlowHandler()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ):
        """Choose the entry type to create."""
        if user_input is not None:
            action = user_input.get("action")
            if action == "su_kien_am_lich":
                return await self.async_step_event_am_lich()
            if action == "su_kien_duong_lich":
                return await self.async_step_event_duong_lich()

            await self.async_set_unique_id("amlich_main")
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title="Âm lịch Việt Nam", data={"is_main": True}
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required("action", default="su_kien_am_lich"): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                "main",
                                "su_kien_am_lich",
                                "su_kien_duong_lich",
                            ],
                            translation_key="setup_action",
                            mode=selector.SelectSelectorMode.DROPDOWN,
                        )
                    )
                }
            ),
        )

    async def async_step_event_am_lich(
        self, user_input: dict[str, Any] | None = None
    ):
        """Create a lunar event entry."""
        errors: dict[str, str] = {}
        if user_input is not None:
            normalised = _normalise_input(user_input)
            error = _validate_lunar_event(normalised)
            if error is None:
                return self.async_create_entry(
                    title=str(normalised.get("event_name", "Sự kiện")),
                    data={
                        "is_main": False,
                        "event_type": "lunar",
                        "event_name": str(normalised.get("event_name", "")),
                        "event_day": normalised.get("event_day"),
                        "event_month": normalised.get("event_month"),
                        "event_year": normalised.get("event_year"),
                        "event_repeat": normalize_repeat(normalised.get("event_repeat")),
                        "birth_day": normalised.get("birth_day"),
                        "birth_month": normalised.get("birth_month"),
                        "birth_year": normalised.get("birth_year"),
                        "event_description": str(
                            normalised.get("event_description", "")
                        ),
                    },
                )
            errors["base"] = error

        return self.async_show_form(
            step_id="event_am_lich",
            data_schema=_event_schema(event_type="lunar"),
            errors=errors,
        )

    async def async_step_event_duong_lich(
        self, user_input: dict[str, Any] | None = None
    ):
        """Create a solar event entry."""
        errors: dict[str, str] = {}
        if user_input is not None:
            normalised = _normalise_input(user_input)
            error = _validate_solar_event(normalised)
            if error is None:
                return self.async_create_entry(
                    title=str(normalised.get("event_name", "Sự kiện")),
                    data={
                        "is_main": False,
                        "event_type": "solar",
                        "event_name": str(normalised.get("event_name", "")),
                        "event_day": normalised.get("event_day"),
                        "event_month": normalised.get("event_month"),
                        "event_year": normalised.get("event_year"),
                        "event_repeat": normalize_repeat(normalised.get("event_repeat")),
                        "event_description": str(
                            normalised.get("event_description", "")
                        ),
                    },
                )
            errors["base"] = error

        return self.async_show_form(
            step_id="event_duong_lich",
            data_schema=_event_schema(event_type="solar"),
            errors=errors,
        )

    async def async_step_import(self, import_data: dict[str, Any]):
        """Create an event entry from another source (e.g. the old ``amlich`` events.db).

        Duplicate events (same type, name, date and repeat) are aborted, so importing twice is safe.
        """
        event_type = "solar" if import_data.get("event_type") == "solar" else "lunar"
        normalised = _normalise_input(import_data)
        error = (
            _validate_solar_event(normalised)
            if event_type == "solar"
            else _validate_lunar_event(normalised)
        )
        if error is not None:
            return self.async_abort(reason=error)

        repeat = normalize_repeat(normalised.get("event_repeat"))
        await self.async_set_unique_id(
            "|".join(
                str(normalised.get(key, ""))
                for key in ("event_name", "event_day", "event_month", "event_year")
            )
            + f"|{event_type}|{repeat}"
        )
        self._abort_if_unique_id_configured()

        data: dict[str, Any] = {
            "is_main": False,
            "event_type": event_type,
            "event_name": str(normalised.get("event_name", "")),
            "event_day": normalised.get("event_day"),
            "event_month": normalised.get("event_month"),
            "event_year": normalised.get("event_year"),
            "event_repeat": repeat,
            "event_description": str(normalised.get("event_description", "")),
        }
        return self.async_create_entry(title=data["event_name"], data=data)
