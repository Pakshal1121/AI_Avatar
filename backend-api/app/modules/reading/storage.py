from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import asdict
from threading import Lock
from typing import Any

from .config import settings

_write_lock = Lock()


def _ensure_dirs() -> None:
    os.makedirs(settings.data_dir, exist_ok=True)
    os.makedirs(os.path.join(settings.data_dir, "reading_attempts"), exist_ok=True)


def new_attempt_id() -> str:
    return uuid.uuid4().hex


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def attempt_path(attempt_id: str) -> str:
    _ensure_dirs()
    return os.path.join(settings.data_dir, "reading_attempts", f"{attempt_id}.json")


def logs_path() -> str:
    _ensure_dirs()
    return os.path.join(settings.data_dir, "reading_logs.json")


def load_json_file(path: str, default: Any) -> Any:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default
    except json.JSONDecodeError:
        return default


def atomic_write_json(path: str, obj: Any) -> None:
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def save_attempt(attempt_id: str, payload: dict[str, Any]) -> None:
    path = attempt_path(attempt_id)
    with _write_lock:
        atomic_write_json(path, payload)


def load_attempt(attempt_id: str) -> dict[str, Any] | None:
    path = attempt_path(attempt_id)
    if not os.path.exists(path):
        return None
    return load_json_file(path, default=None)


def append_log(entry: dict[str, Any]) -> None:
    path = logs_path()
    with _write_lock:
        logs = load_json_file(path, default=[])
        if not isinstance(logs, list):
            logs = []
        logs.append(entry)
        atomic_write_json(path, logs)


def get_user_logs(user_id: str) -> list[dict[str, Any]]:
    path = logs_path()
    logs = load_json_file(path, default=[])
    if not isinstance(logs, list):
        return []
    return [x for x in logs if str(x.get("userId")) == str(user_id)]


def get_attempt_log(attempt_id: str) -> dict[str, Any] | None:
    path = logs_path()
    logs = load_json_file(path, default=[])
    if not isinstance(logs, list):
        return None
    for x in reversed(logs):
        if x.get("attemptId") == attempt_id:
            return x
    return None
    
def update_log(attempt_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
    """Update an existing attempt log entry inside reading_logs.json."""
    path = logs_path()
    with _write_lock:
        logs = load_json_file(path, default=[])
        if not isinstance(logs, list):
            return None
        for i in range(len(logs) - 1, -1, -1):
            if logs[i].get("attemptId") == attempt_id:
                if isinstance(patch, dict):
                    logs[i].update(patch)
                atomic_write_json(path, logs)
                return logs[i]
    return None

def update_attempt(attempt_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
    current = load_attempt(attempt_id)
    if not current:
        return None
    current.update(patch)
    save_attempt(attempt_id, current)
    return current