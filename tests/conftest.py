from unittest.mock import patch

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def tu_bat_tich_hop_tuy_chinh(enable_custom_integrations):
    """Cho phép nạp custom_components/lich_viet trong bộ giả lập Home Assistant."""
    yield


@pytest.fixture(autouse=True)
def gia_lap_frontend():
    """Môi trường thử không có gói giao diện (hass_frontend): bỏ qua bước dựng thành phần `frontend` (phụ thuộc của tích hợp)."""
    with patch("homeassistant.components.frontend.async_setup", return_value=True):
        yield
