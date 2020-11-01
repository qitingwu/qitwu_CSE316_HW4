const express=require("express");
const app=express();
const url=require('url');
const { CONNREFUSED } = require("dns");

var mysql=require("mysql");
var con=mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "pass4root",
    database: "schedule"
});

port = process.env.PORT ||3000;
app.listen(port,()=>{
    console.log("sever started");
});

app.get("/", (req, res)=>{
    res.writeHead(200,{"Content-Type": "text/html"});
    var query = url.parse(req.url,true).query;
    var search = query.search ? query.search : "";
    var filter =query.filter ? query.filter : "";
    var html=`
    <!DOCTYPE html>
<html>
    <head>
        <title>Course Builder</title>
        <style>
            td { white-space:pre; 
            padding: 8px;
            vertical-align: top;}
            tr:nth-child(even){background-color: #f2f2f2;}
        </style>
    </head>
    <body>
        <h1>Stony Brook University CSE Class Find</h1>
        <hr>
        <form method="get" action="/">
            <label for="search">Search</label>
            <input type="text" name="search" value="">
            <label for="filter">in</label>
            <select name="filter">
                <option value="All Fields">All Fields</option>
                <option value="Title">Title</option>
                <option value="Class Number">Class Number</option>
                <option value="Day">Day</option>
                <option value="Time">Time</option>
            </select>
            <input type="submit" value="Find">
            <br>
        </form>
        `;
        
        var sql="SELECT * FROM courses;";
        if(filter == "All Fields"){
            sql=`SELECT * FROM courses
                WHERE Subj       LIKE '%`+search+`%' OR
                CRS       LIKE '%`+search+`%' OR
                Title       LIKE '%`+search+`%' OR
                Cmp       LIKE '%`+search+`%' OR
                Sctn       LIKE '%`+search+`%' OR
                Days       LIKE '%`+search+`%' OR
                StartTime       LIKE '%`+search+`%' OR
                EndTime       LIKE '%`+search+`%' OR
                MtgStartDate       LIKE '%`+search+`%' OR
                MtgEndDate       LIKE '%`+search+`%' OR
                Duration       LIKE '%`+search+`%' OR
                InstructionMode       LIKE '%`+search+`%' OR
                Building       LIKE '%`+search+`%' OR
                Room       LIKE '%`+search+`%' OR
                Instr       LIKE '%`+search+`%' OR
                EnrlCap       LIKE '%`+search+`%' OR
                WaitCap       LIKE '%`+search+`%' OR
                CmbndDescr       LIKE '%`+search+`%' OR
                CmbndEnrlCap       LIKE '%`+search+`%';`;
        }else if(filter == "Class Number"){
            sql=`SELECT * FROM courses
            WHERE CRS       LIKE '%`+search+`%';`;
        }else if(filter == "Title"){
            sql=`SELECT * FROM courses
            WHERE Title       LIKE '%`+search+`%';`;
        }else if(filter == "Day"){
            sql=`SELECT * FROM courses
            WHERE Days       LIKE '%`+search+`%'
            ORDER BY StartTimeInterval;`;
        }else if(filter == "Time"){
            sql=`SELECT * FROM courses
            WHERE StartTime       LIKE '%`+search+`%' OR
            EndTime       LIKE '%`+search+`%';`;
        }

        con.query(sql,function(err, result){
            if(err) throw err;
            html+=`<table>`;
            for(let item of result){
                html+=`
                <tr>
                    <td><b>`+item.Subj+item.CRS+"."+item.Sctn+`</b></td>
                    <td><b>`+item.Title+"</b><br>by "+item.Instr+"<br>"+item.Cmp
                    +": "+item.Days+" "+item.StartTime+"-"+item.EndTime
                    +"<br>Meeting Dates: "+item.MtgStartDate+" to "+item.MtgEndDate
                    +"<br>Duration: "+item.Duration+" minutes      Instruction: "
                    +item.InstructionMode+"<br>Building: "+item.Building+"      Room:"
                    +item.Room+"<br>Enrollment Capability: "+item.EnrlCap
                    +"      Waitlist Capability: "+item.WaitCap
                    +"<br>Combined Description: "+item.CmbndDescr+"      Combined Enrollment: "
                    +item.CmbndEnrlCap+`</td>
                    <td>
                        <form action="/schedule" method="get">
                        <button name="add" value="`+item.ID+`"> Add Class </button></form>
                    </td>
                </tr>`;
        }
        html+=`</table>`;
        res.write(html+ "\n\n<body>\n</html>");
        res.end();
    });
});

app.get("/schedule", (req, res)=>{
    var query = url.parse(req.url, true).query;
    var save=`INSERT INTO record SELECT * FROM courses WHERE courses.ID="`+ query.add+`";`
    var html=`
    <!DOCTYPE html>
        <html>
            <head>
                <title> Schedule </title>
                <style>
                    td {padding: 10px;}
                    tr:nth-child(even){background-color: #f2f2f2;}
                </style>
            </head>
            <body>
                <table style="width:90%">
                    <tr>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    </tr>
                    <tr>
                        <td>Monday</td>
                        <td>Tuesday</td>
                        <td>Wednesday</td>
                        <td>Thursday</td>
                        <td>Friday</td>
                    </tr>
                </table>
                <a href="/"><b>Back</b></a>
            </body>
            </html>`;

    //have all the queries nested in each other so they are forced to finish in order.
    //and wait for each other...
    con.query(save, function(err, result){
        if(err) console.log(err);
        con.query(sqlForDay("M"),function(err,result){
            if(err) console.log(err);
            html=html.replace("<td>Monday</td>", getCell(result));
            con.query(sqlForDay("TU"),function(err,result){
                if(err) console.log(err);
                html=html.replace("<td>Tuesday</td>", getCell(result));
                con.query(sqlForDay("W"),function(err,result){
                    if(err) console.log(err);
                    html=html.replace("<td>Wednesday</td>", getCell(result));
                    con.query(sqlForDay("TH"),function(err,result){
                        if(err) console.log(err);
                        html=html.replace("<td>Thursday</td>", getCell(result));
                        con.query(sqlForDay("F"),function(err,result){
                            if(err) console.log(err);
                            html=html.replace("<td>Friday</td>", getCell(result));
                            res.write(html+"\n\n</body>\n</html>");
                            res.end();
                        });
                    });
                });
            });
        });
    });
});

function getCell(result){
    var htmlString="<td>";
    for(let item of result){
        htmlString += "<b>"+item.STARTTIME+"</b> "
                +item.SUBJ+"-"+item.CRS+"-"+item.SCTN
                +"<br>"+item.TITLE+"<br><br>";
    }
    htmlString+="</td>";
    return htmlString;
}

function sqlForDay(day){
    var sql=`SELECT * FROM record
            WHERE Days          LIKE '%`+day+`%'
            ORDER BY StartTimeInterval;`;
    return sql;
}