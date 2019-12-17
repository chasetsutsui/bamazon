const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    showInventory();
})

const showInventory = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity + "\n")
        }
        userprompt(res);
    })
}

const userprompt = function (res) {
    inquirer.prompt([{
        type: "input",
        name: "choice",
        message: "What is the ID of the product you would like to buy?"
    }]).then(function (answer) {
        var correct = false;
        for (var i = 0; i < res.length; i++) {
            if (res[i].item_id == answer.choice) {
                correct = true;
                var product = answer.choice;
                var id = i;
                inquirer.prompt({
                    type: "input",
                    name: "amount",
                    message: "How many units would you like to buy?",
                    validate: function (value) {
                        if (isNaN(value) == false) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }).then(function (answer) {
                    if ((res[id].stock_quantity - answer.amount) > 0) {
                        connection.query("UPDATE products SET stock_quantity ='" + (res[id].stock_quantity - answer.amount) + "' WHERE item_id='" + product + "'", function (err, results) {
                            console.log("Your purchase has been completed, thank you for shopping at bamazon");
                            showInventory();
                        })
                    } else {
                        console.log("Please select a valid quantity from our available inventory.");
                        userprompt(res);
                    }
                })
            }
        }
    })
}