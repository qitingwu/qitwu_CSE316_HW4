import React, { Component } from 'react';
import './App.css';

var arrays=require('./arrays.js');
//the added classed shouldn't change the page and they should be stored in database
//we will pull them out and use them when needed.

class App extends Component {
  state={
    page:0, //0=search page, 1=schedule page.
    searchResult:[]
  };

  changePage=()=>{
    if(this.state.page===0){
      this.setState({page:1});
    }else{
      this.setState({page:0});
    }
  }

  findResult=()=>{
    var search=[];
    var i, j;
    var category=this.field.value;
    var input=this.search.value.toLowerCase();
    if(category==="All Fields"){
      for(i=0;i<arrays.allCourses.length;i++){
        for(j=0;j<arrays.allCourses[i].length;j++){
            if(arrays.allCourses[i][j].toLowerCase().includes(input)){
                search.push(arrays.allCourses[i]);
                break;}
        }
      }
    }else if(category==="Time"){
      for(i=0;i<arrays.allCourses.length;i++){
          if(arrays.allCourses[i][6].toLowerCase().includes(input)
              || arrays.allCourses[i][7].toLowerCase().includes(input)){
              search.push(arrays.allCourses[i]);
          }
      }
    }else{
      var index=-1;
      if(category==="Title"){
          index=2;}
      if(category==="Class Number"){
          index=1;}
      if(category==="Day"){
          index=5;}
      for(i=0;i<arrays.allCourses.length;i++){
          if(arrays.allCourses[i][index].toLowerCase().includes(input)){
              search.push(arrays.allCourses[i]);
          }
      }
    }
    this.setState({searchResult:search});
  }

  showResult(){
    var count=1;
      return this.state.searchResult.map((index) => {
        var name=index[0]+index[1]+"."+index[4];
        var descrip=index[2]+"\nby "+index[14]+"\n"+index[3]
            +": "+index[5]+" "+index[6]+"-"+index[7]
            +"\nMeeting Dates: "+index[8]+" to "+index[9]
            +"\nDuration: "+index[10]+" minutes      Instruction: "
            +index[11]+"\nBuilding: "+index[12]+"      Room:"
            +index[13]+"\nEnrollment Capability: "+index[15]
            +"      Waitlist Capability: "+index[16]
            +"\nCombined Description: "+index[17]+"      Combined Enrollment: "
            +index[18];
        //check time overlap. determine what to do for button.(if statement?)
        //add action for button, take the count index in searchResult
        //store in database(!) and update the added classes array(?)
        return (
           <tr>
             <td>{count++}</td>
             <td>{name}</td>
             <td>{descrip}</td>
             <td><button>Add</button></td>
           </tr>
        )
     });
  }

  showPage()
  {
    if(this.state.page===0){
        return(
          <div>
          <h1>Stony Brook University CSE Class Find</h1>
          <hr/>
          <label for="search">Search</label>
          <input type="text" name="search" ref={(input)=>this.search=input} />
          <label for="field">in</label>
          <select name="field" ref={(input)=>this.field=input}>
            <option value="All Fields">All Fields</option>
            <option value="Title">Title</option>
            <option value="Class Number">Class Number</option>
            <option value="Day">Day</option>
            <option value="Time">Time</option>
          </select>
          <input type="button" onClick={this.findResult} value="Find" />
          <input type="button" onClick={this.changePage} value="Generate Schedule" />
          <div id="result">
            <table>
              <tbody>{this.showResult()}</tbody>
            </table>
          </div>
          </div>
        );
    }else{
      return(
        <div>
          <input type="button" onClick={this.changePage} value="Back to Search" />
        </div>
      );
    }
  }

  render() {
    //should I load added classes from database here? how?
    return (
      <div className="App">
        {this.showPage()}
      </div>
    );
  }
}

export default App;
