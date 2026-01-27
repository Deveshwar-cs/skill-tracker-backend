POST /api/users/register
Body:
{
"name": "Ace",
"email": "ace@gmail.com",
"password": "123456"
}

POST /api/users/login
Body:
{
"email": "ace@gmail.com",
"password": "123456"
}

Response:
{
"token": "JWT_TOKEN"
}

POST /api/notes/add
Headers: Authorization: Bearer TOKEN
Body:
{
"title": "Note 1",
"content": "Some text"
}

GET /api/notes/allnotes
Headers: Authorization: Bearer TOKEN

POST /api/skills/addSkill
Headers: Authorization: Bearer TOKEN
Body:
{
"name": "Backend"
}

GET /api/skills/getSkills/:id
Headers: Authorization: Bearer TOKEN

POST /api/tasks/addTask/:skillId
Headers: Authorization: Bearer TOKEN
Body:
{
"title": "Learn JWT"
}

GET /api/tasks/getTask/:skillId?page=1&limit=5&completed=false
Headers: Authorization: Bearer TOKEN

PUT /api/tasks/toggle/:taskId
