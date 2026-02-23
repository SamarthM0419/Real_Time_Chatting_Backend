# Chat Service Architecture Flow

```mermaid
flowchart LR

subgraph Client
A([User Accepts Request])
G([User Clicks Chat])
end

subgraph Request_Service
B[Request Service]
end

subgraph Infrastructure
C{{RabbitMQ<br/>request.accepted}}
E[(MongoDB)]
F[(Redis)]
end

subgraph Chat_Service
D[Chat Service Consumer]
H[Create Direct Chat]
I[[WebSocket Communication]]
end

A --> B
B --> C
C --> D
D --> E
D --> F
F --> G
G --> H
H --> I
