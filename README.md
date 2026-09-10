# Smart Home Ecosystem – Web Management Dashboard

![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![Component](https://img.shields.io/badge/System-Web%20Dashboard-green)

A responsive administrative web dashboard for the **Smart Home Ecosystem**. Allows users to inspect real-time sensor metrics, monitor system status, view interactive charts, and remotely toggle home actuators from any modern desktop or mobile browser.

---

## Key Features

- **Real-Time Data Streaming:** Instant UI updates for sensor changes via WebSockets.
- **Device Management:** Interactive controls for lamps, relays, and environmental monitors.
- **Historical Analytics:** Visual charts displaying temperature, humidity, and energy consumption trends over time.
- **Responsive UI:** Dark fantasy/modern dark-mode interface optimized for desktop and mobile viewports.

---

## Author

- **Gabriel ([@CrimsonGabriel](https://github.com/CrimsonGabriel))** – Frontend development, state management, and API integration.

---

## Related Repositories

- [Central VPS Backend](https://github.com/CrimsonGabriel/VPS-backend)
- [Raspberry Pi Node](https://github.com/CrimsonGabriel/RaspberryPI)
- [Android App Repository](https://github.com/CrimsonGabriel/Android-SmartHome)
```mermaid
graph TD
    subgraph Clients["📱 & 💻 Client Layer"]
        APP["📱 Android App<br/>(Mobile Client)"]
        WEB["💻 Web Dashboard<br/>(VPS Frontend)"]
    end

    subgraph Cloud["☁️ Cloud Infrastructure"]
        VPS["⚡ Central VPS Backend<br/>(REST API / WebSockets / DB)"]
    end

    subgraph Edge["🔌 Edge & Hardware Layer"]
        RPI["🔌 Raspberry Pi<br/>(IoT Edge Node)"]
        SENSORS["🌡️ Sensors & Actuators<br/>(Relays, Temp, Motion)"]
    end

    %% Connections
    APP <-->|"REST API / WebSockets"| VPS
    WEB <-->|"REST API / WebSockets"| VPS
    VPS <-->|"Telemetry / Commands (MQTT/REST)"| RPI
    RPI <-->|"GPIO / Serial"| SENSORS

    %% Styling
    style VPS fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style RPI fill:#1e293b,stroke:#f97316,stroke-width:2px,color:#fff
    style APP fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff
    style WEB fill:#1e293b,stroke:#22c55e,stroke-width:2px,color:#fff
    style SENSORS fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#94a3b8
