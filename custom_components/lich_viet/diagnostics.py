"""Diagnostics support for the Vietnamese Lunar Calendar integration."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN

TO_REDACT = {
    "event_name",
    "event_description",
    "event_day",
    "event_month",
    "event_year",
    "event_date",
    "birth_day",
    "birth_month",
    "birth_year",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return privacy-safe diagnostics for a config entry."""
    return {
        "domain": DOMAIN,
        "entry": {
            "title": "**REDACTED**",
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": async_redact_data(dict(entry.options), TO_REDACT),
            "state": entry.state.name,
        },
        "frontend_resources_registered": bool(
            hass.data.get(DOMAIN, {}).get("frontend_resources_registered")
        ),
        "frontend_version_base": hass.data.get(DOMAIN, {}).get(
            "frontend_version_base"
        ),
        "frontend_resource_urls": list(
            hass.data.get(DOMAIN, {}).get("frontend_resource_urls", ())
        ),
    }
