const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); 
const date = require( __dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

const db = "mongodb+srv://keshav:keshav@fruitsdb.h9iaxc9.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then( ()=>
console.log("Connected to mongodb Successful")
);

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to ToDoList"});
const item2 = new Item({name: "Hit the + button to add the item"});
const item3 = new Item({name: "<-- Hit this to delete an item "});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    day = date.getDate();
    // const day = today.toLocaleDateString("hi-IN", options);

    Item.find({})
    .then((foundItems)=>{
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems)
            .then(()=>{console.log("Inserted")})
            .catch((err)=>{console.log(err)});

            res.redirect("/");
        } 
        else {
            res.render("list", {
                listTitle: day,
                newListItem: foundItems
            });
        }
    })
    .catch((err)=>{console.log(err)});
})

app.get("/:customListName", function(req, res){ 
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then((foundList )=>{
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            }); 
            list.save();
            res.redirect("/" + customListName)
        }
        else{
            res.render("list", {
                listTitle: foundList.name,
                newListItem: foundList.items
            })
        }
    })

    

})

app.post("/", function(req, res){
    let day = date.getDate();
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({name: itemName});

    if(listName === day){
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({name: listName})
        .then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


})

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    let day = date.getDate();

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId)
        .then(()=>{res.redirect("/")}) 
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then(()=>{res.redirect("/" + listName);})
        .catch((err)=>{console.log(err)});
    }
})

app.get("/work", function(req, res){
    res.render("list", {
        listTitle: "Work List",
        newListItem: workItems
    })
})

app.get("/about", function(req, res){
    res.render("about");
})

let port = process.env.PORT;
if(port == NULL || port == ""){
    port = 3000;
}
app.listen(port , function(){
    console.log("Server started successfully");
});