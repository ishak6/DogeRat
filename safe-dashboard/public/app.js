"use strict";

const byId = (id) => document.getElementById(id);

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [days ? days + "d" : null, hours + "h", minutes + "m", secs + "s"].filter(Boolean).join(" ");
}

async function refreshStatus() {
  const button = byId("refresh");
  button.disabled = true;
  byId("message").textContent = "Refreshing server status…";
  try {
    const response = await fetch("/api/status", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error("Status request failed (" + response.status + ")");
    const data = await response.json();
    byId("status").textContent = data.status.toUpperCase();
    byId("status-dot").classList.add("online");
    byId("message").textContent = "The dashboard server is responding normally.";
    byId("uptime").textContent = formatUptime(data.uptimeSeconds);
    byId("node").textContent = data.nodeVersion;
    byId("platform").textContent = data.platform;
    byId("memory").textContent = (data.memoryBytes.rss / 1024 / 1024).toFixed(1) + " MB";
    byId("checked").textContent = new Date(data.checkedAt).toLocaleString();
  } catch (error) {
    byId("status").textContent = "UNAVAILABLE";
    byId("status-dot").classList.remove("online");
    byId("message").textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

byId("refresh").addEventListener("click", refreshStatus);
refreshStatus();
