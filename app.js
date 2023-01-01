const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
app.use(express.urlencoded({ extended: false }));

/*app.get("/", function (request, response) {
  response.send("Hello World");
});*/

// set ejs as view engine

app.set("view engine", "ejs");
app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", {
      allTodos,
    });
  } else {
    response.json({
      allTodos,
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    // create a todo
    const date = new Date();
    await Todo.addTodo({ title: "Test", dueDate: date, completed: false });

    const todos = await Todo.findAll();
    console.log(todos);
    const d = new Date().toLocaleDateString("en-CA");
    const overdue = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: false },
      order: [["id", "ASC"]],
    });
    const overdueComplete = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: true },
    });
    const later = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d } },
    });
    const laterComplete = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d }, completed: true },
    });
    const today = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d } },
    });
    const todayComplete = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d }, completed: true },
    });

    app.locals.tasks = todos;
    app.locals.overdue = overdue;
    app.locals.overdueComplete = overdueComplete;
    app.locals.later = later;
    app.locals.laterComplete = laterComplete;
    app.locals.today = today;
    app.locals.todayComplete = todayComplete;

    response.render("index");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);

  const deleteTodo = await Todo.destroy({ where: { id: request.params.id } });
  response.send(deleteTodo ? true : false);
});

module.exports = app;
