//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-harsh:dotdedsec@cluster0-zvbju.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Welcome to your To Do List !"
});

const item2 = new Item({
  name: "Hit the + button to add new Item"
});

const item3 = new Item({
  name: "<-- Hit this button to delete the item"
});

// Item.insertMany([item1,item2,item3], function(err){
//     if(err){
//       console.log(err);
//     }else{
//       console.log("Successfully Inserted data into Database");
//     }
// });

app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(items.length===0)
    {
      Item.insertMany([item1,item2,item3], function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully Inserted data into Database");
          }
      })
      res.redirect("/");
    }
      res.render("list", {listTitle: "Home", newListItems: items});
})
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
    const item = new Item({
      name: itemName
    })
    if(listName==="Home"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName}, function(err, result){
        result.items.push(item);
        result.save();
        res.redirect("/"+listName);
      })
    }

});

app.post("/delete", function(req,res){
    const id = req.body.checkbox;
    const listName = req.body.listName;
    if(listName==="Home"){
      Item.deleteOne({_id: id}, function(err){
        if(err){
          console.log(err);
        }else{
          res.redirect("/");
        }
    })
  }else{
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:id}}},function(err, result){
      if(!err){
        res.redirect("/"+listName);
      }

    })
    // List.deleteOne({_id:id}, function(err){
    //   if(err){
    //     console.log(err);
    //   }
    //     else{
    //       res.redirect("/"+listName);
    //     }
    //   })
  }
})

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const list1 = new List({
  name: "Home",
  items: [
    {
      name: "Hello"
    }
  ]
});

list1.save();

app.get("/:newListName", function(req,res){
    let customName = _.capitalize(req.params.newListName);

    List.findOne({name:customName}, function(err, result){
      if(!result){
            const list = new List({
              name: customName,
              items: [item1,item2,item3]
            })
           list.save();
           res.redirect("/"+customName);
      }else{
          res.render("list", {listTitle:result.name, newListItems: result.items});
      }
    })
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
