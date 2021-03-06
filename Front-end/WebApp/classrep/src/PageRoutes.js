import React, {Component} from 'react'
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Login from './Login';
import Main from './Main'
import ViewPost from './ViewPost';
//import AddPost from './AddPost';
import ChangeTime from './ChangeTime';
import ChangeVenue from './ChangeVenue';
import Timetable from './Timetable';
import viewTimetable from './ViewTimetable';
import viewCourse from './viewCourse';



export default class PageRouter extends Component{
    render(){
        return(
                
                <BrowserRouter>    
                    <Switch>
                        <Route exact path="/" component={Login} />
                        <Route exact path="/main" component={Main} />
                        <Route exact path="/viewTimetable" component={viewTimetable}/>
                        <Route exact path="/ViewPost" component={ViewPost}/>
                        <Route exact path="/changeTime" component={ChangeTime}/>
                        <Route exact path="/changeVenue" component={ChangeVenue}/>
                        <Route exact path="/viewCourse" component={viewCourse}/>
                    </Switch>
                </BrowserRouter>
                
        );
    }

}