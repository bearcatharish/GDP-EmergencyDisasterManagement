$(document).ready(function(){
    var parseApplicationId = ''
    var parseJavascriptKey = ''
    Parse.initialize(parseApplicationId, parseJavascriptKey)
    var Test = Parse.Object.extend('Temp')
    var test = new Test() 
})

