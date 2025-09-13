# Relaciones entre modelos (alto nivel)

```mermaid
erDiagram
  User ||--o{ DepartmentAssignment : has
  User ||--o{ Request : submits
  User ||--o{ Notification : receives
  Request ||--o{ RequestHistory : logs

  User {
    string id PK
    string email
    string name
    string role
    string department
    string position
    string barcode
    string supervisorId FK
  }
  DepartmentAssignment {
    string id PK
    string userId FK
    string department
    string position
  }
  Request {
    string id PK
    string employeeId FK
    string type
    date startDate
    date endDate
    string status
    string stage
  }
  RequestHistory {
    string id PK
    string requestId FK
    string action
    string by
    date date
  }
  Notification {
    string id PK
    string userId FK
    string title
    string message
    string type
    bool read
  }
  PolicyRule {
    string id PK
    string type
    int minAdvanceDays
    int maxConsecutiveDays
    bool requiresApproval
    string approvalLevels // JSON
  }
  PolicyChange {
    string id PK
    string policyId
    string type
    string field
    string from
    string to
    string actor
    date date
  }
```

Nota: `PolicyRule` y `PolicyChange` no tienen relaciones Prisma explícitas en el esquema, pero `PolicyChange.policyId` referencia lógicamente una `PolicyRule`.
