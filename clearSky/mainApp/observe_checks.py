# mainApp/observe_checks.py
def checkpoint_cloud(cc):
    if cc is None: return {"ok": False, "reason": "Cloud cover unknown"}
    if cc <= 25: return {"ok": True, "reason": f"Cloud cover low ({cc}%)"}
    if cc <= 60: return {"ok": False, "reason": f"Partly cloudy ({cc}%)"}
    return {"ok": False, "reason": f"Overcast ({cc}%)"}

def checkpoint_precip(precip_mm=None, precip_prob=None):
    if precip_mm is None and precip_prob is None:
        return {"ok": False, "reason": "Precipitation unknown"}
    if (precip_mm is not None and precip_mm > 0) or (precip_prob is not None and precip_prob >= 0.2):
        return {"ok": False, "reason": "Precipitation expected"}
    return {"ok": True, "reason": "No precipitation expected"}

def checkpoint_visibility(vis_km):
    if vis_km is None: return {"ok": False, "reason": "Visibility unknown"}
    if vis_km >= 10: return {"ok": True, "reason": f"Good visibility ({vis_km} km)"}
    if vis_km >= 5: return {"ok": False, "reason": f"Moderate visibility ({vis_km} km)"}
    return {"ok": False, "reason": f"Poor visibility ({vis_km} km)"}

def checkpoint_humidity(h):
    if h is None: return {"ok": False, "reason": "Humidity unknown"}
    if h <= 90: return {"ok": True, "reason": f"Humidity {h}%"}
    return {"ok": False, "reason": f"Very humid ({h}%) — haze likely"}

def checkpoint_wind(ws):
    if ws is None: return {"ok": False, "reason": "Wind unknown"}
    if ws <= 7: return {"ok": True, "reason": f"Calm ({ws} m/s)"}
    if ws <= 12: return {"ok": False, "reason": f"Strong wind ({ws} m/s)"}
    return {"ok": False, "reason": f"Very strong wind ({ws} m/s)"}

def checkpoint_moon(illum_pct=None, moon_alt=None):
    if illum_pct is None:
        return {"ok": False, "reason": "Moon info unknown"}
    if moon_alt is not None and moon_alt < 0:
        return {"ok": True, "reason": "Moon below horizon"}
    if illum_pct <= 30:
        return {"ok": True, "reason": f"Low moonlight ({illum_pct}%)"}
    return {"ok": False, "reason": f"Bright moon ({illum_pct}%)"}

def build_checkpoints(payload):
    """
    payload keys (optional): cloud_percentage, precip_mm, precip_prob,
      visibility_km, humidity, wind_speed, moon_illum_pct, moon_altitude_deg
    """
    return {
        "cloud_cover": checkpoint_cloud(payload.get("cloud_percentage")),
        "precipitation": checkpoint_precip(payload.get("precip_mm"), payload.get("precip_prob")),
        "visibility": checkpoint_visibility(payload.get("visibility_km")),
        "humidity": checkpoint_humidity(payload.get("humidity")),
        "wind": checkpoint_wind(payload.get("wind_speed")),
        "moon": checkpoint_moon(payload.get("moon_illum_pct"), payload.get("moon_altitude_deg"))
    }
