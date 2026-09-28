---
name: api-skill
description: API design and brainstorming skill. Use before implementing APIs to brainstorm requirements, design robust RESTful, GraphQL, or gRPC interfaces, specify endpoints, define request/response schemas, establish authentication and security standards, and generate OpenAPI specifications.
risk: safe
source: LambdaTest/agent-skills
---

# API Design & Brainstorming Skill

The **api-skill** combines collaborative requirement brainstorming with production-grade API architecture. It guides agents and developers to systematically design, validate, and document API interfaces before implementing code.

## When to Use

- When brainstorming new API features, resource models, or developer workflows.
- When designing RESTful, GraphQL, or gRPC endpoints from scratch.
- When defining contracts between frontend and backend teams.
- When establishing team API conventions: error schemas, pagination, and auth standards.
- When generating OpenAPI / Swagger specifications.

---

## Operating Protocol: Brainstorming Before Implementation

Follow the [Brainstorming Protocol](./references/brainstorming_protocol.md) to prevent premature coding:

1. **Clarify Intent**: Determine whether the consumer needs a high-level endpoint summary or full detailed contract specifications.
2. **Context Gathering**: Map existing entities, consumer requirements (web, mobile, third-party), and throughput needs.
3. **Challenge Assumptions**: Check for missing edge cases (concurrency, idempotency, rate limiting, partial failures).

---

## Core API Design Guidelines

### 1. Resource Modeling & URI Conventions

- Use nouns in plural form for collections: `/api/v1/users`, `/api/v1/orders`.
- Express sub-resources hierarchically: `/api/v1/users/{userId}/orders`.
- Keep URLs clean; use query parameters for operations: `GET /api/v1/products?category=electronics&sort=-createdAt`.
- Never put actions in URLs; use standard HTTP methods instead:
  - `GET`: Retrieve resource (Safe, Idempotent).
  - `POST`: Create resource (Not Idempotent).
  - `PUT`: Full replacement of resource (Idempotent).
  - `PATCH`: Partial update of resource (Not necessarily Idempotent).
  - `DELETE`: Remove resource (Idempotent).

### 2. Standard HTTP Response Codes

| Status Code | Meaning | Use Case |
| :--- | :--- | :--- |
| `200 OK` | Successful request | Successful GET, PUT, PATCH |
| `201 Created` | Resource created | Successful POST with `Location` header |
| `204 No Content` | Success without body | Successful DELETE |
| `400 Bad Request` | Malformed syntax | Malformed JSON or invalid types |
| `401 Unauthorized` | Missing/invalid authentication | Token expired or absent |
| `403 Forbidden` | Authenticated but not permitted | Role/permission insufficient |
| `404 Not Found` | Resource missing | Entity ID does not exist |
| `409 Conflict` | State conflict | Duplicate unique key, concurrent edit |
| `422 Unprocessable` | Semantic validation failed | Business rule failed, Zod/Joi error |
| `429 Too Many Requests` | Rate limit exceeded | Include `Retry-After` header |
| `500 Internal Error` | Unexpected server failure | Server crashed or uncaught exception |

### 3. Pagination, Filtering, and Sorting

- **Cursor Pagination** (Recommended for scale):
  `GET /api/v1/items?cursor=eyJpZCI6MTIzfQ&limit=25`
  Returns:
  ```json
  {
    "data": [...],
    "pagination": {
      "nextCursor": "eyJpZCI6MTUwfQ",
      "hasMore": true
    }
  }
  ```
- **Offset Pagination** (For simple, small datasets):
  `GET /api/v1/items?page=1&limit=20`

### 4. Standardized Error Format (RFC 7807)

Always return structured errors:
```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request payload failed schema validation",
  "instance": "/api/v1/users/register",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## Detailed Endpoint Specification Template

Use this format when generating API specifications:

```markdown
### `RESOURCE_NAME`

#### `METHOD /path/to/endpoint`
> Clear description of endpoint behavior and business rules.

**Headers**
| Header | Value | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `Bearer <jwt>` | Yes | Access token |
| `Content-Type` | `application/json` | Yes | Request payload type |
| `Idempotency-Key` | `<uuid>` | Conditional | For financial/write operations |

**Request Body**
```json
{
  "field": "type — description"
}
```

**Responses**
- **`200 OK` / `201 Created`**:
```json
{
  "data": { ... }
}
```
- **`400` / `422` Validation Error**:
```json
{
  "status": 422,
  "errors": [ ... ]
}
```
```

---

## Reference Guides

- [Brainstorming Protocol](./references/brainstorming_protocol.md): Guidelines for structured dialogue and design exploration.
- [API Designer Guidelines](./references/api_designer_guidelines.md): Detailed output templates and endpoint mapping patterns.
- [API Security Patterns](./references/api_security_patterns.md): JWT validation, rate limiting, and CORS best practices.
