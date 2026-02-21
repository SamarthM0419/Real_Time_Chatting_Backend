# Group Chat Service Architecture Flow

```mermaid
flowchart LR

subgraph Client
A([User Accepts Invite])
G([Initiates Group Chat<br/>with Connected Users])
end

subgraph Request_Service
B[Request Service<br/>Publishes Event]
end

subgraph Infrastructure
C{{RabbitMQ<br/>request.accepted}}
E[(MongoDB<br/>Connections & Chats)]
F[(Redis<br/>Connection Cache)]
end

subgraph Chat_Service
D[Chat Consumer]
H[Create Group API<br/>Validate & Save]
I[[Socket.IO Room<br/>Message Broadcast]]
end

A --> B
B --> C
C --> D
D -->|Upserts Connection| E
D -->|Caches Status| F
F -.->|Validates Connection| H
G --> H
H -->|Saves New Group| E
H -->|Clients Join Room| I