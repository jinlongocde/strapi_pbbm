# PBBM Dev-Test (Strapi)

### Task
* Install a local instance of latest stable Strapi CMS with MariaDB as database
* Create one content type (collection type) in Strapi named Activities 
* Activities content type should have the follwing fields Title, Sub-Title, Description, Pictures, Price  
* Each field in the Activities content type should be multilingual (EN, DE, ES). Hint: This can be achieved using components in Strapi or you can use any other solution as well
* Create a custom endpoint PUT /activities_price for Activities which accepts a JSON body with parameters as following:-{Discount:10}
* This put request will update all the activities price and decrease them by the percent (e.g. 10% as per the above JSON object). Hint: Strapi provides standard endpoints by default for each content type but for this step a custom endpoint needs to be created for the Activities content type.
* Configure a plugin to send automatic email to info@mallorcard.es whenever a new Activity is created in activities. Using Strapi plugin system is Mandatory. Hint: Can be achieved by using Nodemailer provider. For this step you can create a sample Gmail or any other email provider account for testing. 
* Commit the complete Strapi application with database dump, Strapi and DB credentials in Readme file to GIT 

Database filename:
> filename : sample.sql

#### How many hours spent 
> Install Simple Strapi CMS and MariaDB : 20 mins
> Creating new content type `Activity`: 10 mins
> Creating new endpoint /activities_price : 30 mins
> Sending email : 30 mins


#### How to install
> * git clone https://github.com/jinlongocde/strapi_pbbm.git 
>  * npm install 
>  * cd admin & npm install
>  * Install MariaDB and import sql file ( dbname :strapi_db, username:root, password: No)
>  * strapi start
>  * visit http://localhost:1337/admin  (username: Cai Renhu, password: 123123)


#### How to create Activity Content Type
Already created activity content type if you import sql , but here i mention how to create content type.
> Goto Content Type Builder and add new content type
> Add fields and set fields type
> After complete, you can see the Activities in top left side menu.
> You can add new activities throught Activity Content Type.

#### Activity Table schema
id | Title_en | Sub_title_en | Description_en | Title_de | Sub_title_de | Description_de | Title_es | Sub_title_es | Description_es |Price
------------- |------------- | ------------- |-------------|------------- |-------------| ------------- | ------------- |------------- | -------------|---------
INT | varchar ( 100) | varchar (100) | Text | varchar(100) | varchar(100) | Text | varchar(100) | varchar (100) | Text| Decimal(10, 2)

#### Pre Actions
> In Strapi admin panel, goto Roles & Permissions > Public > Activities
> Check Permission.  If not selected, Select all checkboxes  (activities_price,count,create,destroy,find,findone,testemail,update)

#### How to Create Custom EndPoint  /activities_price
In order to implement custom endpoint, you need to define custom route and callback function of it inside activity content type.
> Open the source code using VSCode or other IDE Tool.
> You can see api/activities folder. This folder created after created `activity` content type.
> check config/routes.json and add following code at the bottom of json file.
````` json
{
      "method": "PUT",
      "path":"/activities_price",
      "handler": "Activities.activities_price",
      "config": {
        "policies": []
      }
}
`````
Handler means the callback funtion when request /activities_price
> Check controllers/Activities.js and add activities_price() function
``````` javascript
activities_price: async (ctx) => {
    const percent = ctx.request.body;
    return strapi.services.activities.update_all_prices(percent);
}
```````
Call service function to update the price based on discount value as request param.
> Check services/Activities.js and add update_all_prices(percent) function
``````` javascript
update_all_prices: async (percent) => {
   Activities.query(buildQuery({ model: Activities})).fetchAll().then(function( resData) {
     _.each(resData.models, function(model) {      
      const newPrice = model.attributes.Price - model.attributes.Price/100 * percent.Discount;
      Activities.forge({id: model.attributes.id}).save({Price: newPrice});
     })
   })
   return Activities.query(buildQuery({ model: Activities})).fetchAll();
}
```````
Using query builder, loop all activities and update prices. And then return updated new all activites.

#### How to Customize Content Manager plugin
In order to catch the endpoint whenever add new activity, it requires to customize Strapi content-manager-plugin.
In admin panel, when user create/update/delete content type elements, it execute the content-manager plugin
> Goto root folder/plugins/content-manager and check controllers and services
> In services/ContentManager.js file, there are add and edit functions 
Add() is executed when create new activity, Edit() is executed when update activity 
You can add send email function in these functions.

#### How to Send email 
> By default, in Strapi, there are sendemail plugin. But you need to set email account providers by install nodemailer
> Install nodemailer email provider 
> npm i strapi-provider-email-nodemailer
> After install, goto Strapi admin panel
> Goto Plugins/Email Setting  and select provider into nodemailer
> Set mailer configurations (Host, port, username, password, etc). As test mode, you can use mailtrap.io (Free Mail Hosting service)
> After complete setup, you can add  send email function inside add() / edit() function in services/ContentManager.js file
At the start of add() function , add following code
````` javascript
    await strapi.plugins['email'].services.email.send({
      to: 'info@mallorcard.es',
      from: 'support@strapi.io',
      replyTo: 'noreply@strapi.io',
      subject: 'Added new activity ' ,
      text: 'Added new activity ',
    });
`````
You will receive email when create new activity.


#### Thank you. 
####### JLCode (Cai Renhu) [Website](http://jinlongcode.com) / [Linkedin](https://www.linkedin.com/in/cai-renhu-70bb44189/)


