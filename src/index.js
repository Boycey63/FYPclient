import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Route, Switch, HashRouter} from 'react-router-dom';

import Login from "./Routes/Login";
import Register from "./Routes/RegisterPage";
import Home from "./Routes/HomePage";
import ReviewPage from "./Routes/RecentReviews";
import WriteReview from "./Routes/CreateReview";
import NewBusiness from "./Routes/CreateBusiness";
import AllBusinesses from "./Routes/AllBusinesses";
import SingleBusiness from "./Routes/SingleBusiness";
import SearchArea from "./Routes/SearchArea";
import AdminReviewPage from "./Routes/AdminReviewPage";
import MyReviews from "./Routes/MyReviews";
import ViewAccount from "./Routes/ViewAccount";
import MyBusiness from "./Routes/MyBusiness";
import AboutSite from "./Routes/AboutSite";
import ErrorPage from "./Routes/ErrorPage";
import SearchedTerm from "./Routes/SearchedTerm";

class App extends Component {

    render() {
        return (
            <HashRouter>
                <Switch>
                    {/*Setting up the URL Routes*/}
                    <Route path="/" exact component={AboutSite}/>
                    <Route path="/Home" exact component={Home}/>
                    <Route path="/Login" exact component={Login}/>
                    <Route path="/Register" exact component={Register}/>
                    <Route path="/RecentReviews" exact component={ReviewPage}/>
                    <Route path="/AllBusinesses" exact component={AllBusinesses}/>
                    <Route path="/SingleBusiness/:business" exact component={SingleBusiness}/>
                    <Route path="/SearchedTerm/:searchterm" exact component={SearchedTerm}/>
                    <Route path="/NewBusiness" exact component={NewBusiness}/>
                    <Route path="/WriteReview" exact component={WriteReview}/>
                    <Route path="/SearchArea" exact component={SearchArea}/>
                    <Route path="/AdminReviewPage" exact component={AdminReviewPage}/>
                    <Route path="/MyReviews" exact component={MyReviews}/>
                    <Route path="/ViewAccount" exact component={ViewAccount}/>
                    <Route path="/MyBusiness" exact component={MyBusiness}/>
                    <Route path="/ErrorPage/:dbError" exact component={ErrorPage}/>
                    <Route component={ErrorPage}/>
                </Switch>
            </HashRouter>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));