import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Redirect } from 'react-router';
import axios from "axios/index";
import "./CSS/ExtraCss.css";
let jwt = require('jsonwebtoken');

class AdminReviewPage extends Component {

    constructor() {
        super();
        this.state = {
            reviewText: '',
            score: 0,
            redirect: false,
            starRating:'',
            signedIn: false,
            userDetails: [],
            reviewTitle:'',
            business: [],
            businessID: '',
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            userLocation:'',
        };
    }

    componentDidMount(){
        if(!localStorage.getItem('location')) {
            this.setState({
                redirectOnInitialPage: true,
            });
        }else{
            this.setState({
                userLocation: localStorage.getItem('location'),
            });
        }

        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;


        if(retrievedObject === null){
            self.setState({ redirect: true });
            self.setState({ signedIn: false });
        }else{
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers:{
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                if(res.data === "pass"){
                    self.setState({userDetails: jwt.decode(tokenValue.token)});
                    self.setState({ signedIn: true });

                    if(self.state.userDetails.user.userType === 3){
                        self.setState({
                            userType: 3,
                        });
                    }else{
                        self.setState({ redirect: true });
                    }
                }else{
                    self.setState({ signedIn: false });
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).catch(function (error) {
                alert(error);
            });
        }

        fetch('/select/BusinessTable')
            .then(res => res.json())
            .then(business => this.setState({ business }));
    }

    componentDidUpdate(){
        document.getElementById("checkLogin").style.visibility = "visible";
    }

    inputChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    Submit = (e) =>{
        e.preventDefault();

        axios({
            method: 'post',
            url: '/insert/review',
            data: {
                reviewTitle: this.state.reviewTitle,
                Stars: this.state.starRating,
                ReviewText: this.state.reviewText,
                businessID: this.state.businessID,
                userID: this.state.userDetails.user.id,
            }
        }).then(function (response) {
            alert(response.data);
        }).catch(function (error) {
            alert(error);
        });
    };

    Test = (e) =>{
        e.preventDefault();

        axios({
            method: 'post',
            url: '/classify/test',
            data: {
                text: this.state.reviewText
            }
        }).then(function (response) {
            alert(response.data);
        }).catch(function (error) {
            alert(error);
        });
    };

    Export = (e) =>{
        e.preventDefault();

        axios({
            method: 'post',
            url: '/classify/export',
            data: {
                text: this.state.reviewText,
            }
        }).then(function (response) {
            alert(response.data);
        }).catch(function (error) {
            alert(error);
        });
    };

    Train = (e) =>{
        e.preventDefault();

        axios({
            method: 'post',
            url: '/classify/train',
            data: {
                text: this.state.reviewText,
                starRating: this.state.starRating
            }
        }).then(function (response) {
            alert(response.data);
        }).catch(function (error) {
            alert(error);
        });
    };

    Logout = (e) =>{
        e.preventDefault();
        localStorage.clear();
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        return (
            <div className="overallPage">
                <nav className="navbar navbar-inverse">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-2" aria-expanded="true">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <NavLink exact to="/" className="navbar-brand ">The Little Guys</NavLink>
                        </div>

                        <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-2" aria-expanded="true">
                            <ul className="nav navbar-nav">
                                <li><NavLink exact to="/Home">Home</NavLink> <span className="sr-only">(current)</span></li>
                                <li><NavLink exact to="/RecentReviews">Recent Reviews</NavLink></li>
                                <li><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
                                <li><NavLink exact to="/SearchArea">Search Area</NavLink></li>
                            </ul>

                            {this.state.signedIn && (
                                <ul className="nav navbar-nav navbar-right" id="checkLogin">
                                    <li className="dropdown">
                                        <a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{this.state.userDetails.user.username}<span className="caret"></span></a>
                                        <ul className="dropdown-menu" role="menu">
                                            {this.state.userType === 1 &&
                                            <li>
                                                <NavLink activeClassName ="active" exact to="/WriteReview">Write a Review</NavLink>
                                                <NavLink activeClassName ="active" exact to="/MyReviews">My Reviews</NavLink>
                                            </li>
                                            }
                                            {this.state.userType === 2 &&
                                            <li>
                                                <NavLink activeClassName="active" exact to="/NewBusiness">Create New Business</NavLink>
                                                <NavLink activeClassName="active" exact to="/MyBusiness">My Business</NavLink>
                                            </li>
                                            }

                                            {this.state.userType === 3 &&
                                            <li>
                                                <NavLink activeClassName ="active" exact to="/WriteReview">Write a Review</NavLink>
                                                <NavLink activeClassName="active" exact to="/NewBusiness">Create New Business</NavLink>
                                                <NavLink activeClassName ="active" exact to="/MyReviews">My Reviews</NavLink>
                                                <NavLink activeClassName="active" exact to="/MyBusiness">My Business</NavLink>
                                                <NavLink activeClassName="active" exact to="/AdminReviewPage">Admin Page</NavLink>
                                            </li>
                                            }
                                            <li>
                                                <NavLink activeClassName ="active" exact to="/ViewAccount">View Account</NavLink>
                                            </li>
                                        </ul>
                                    </li>
                                    <li><NavLink exact to="/Login" onClick={this.Logout}>Logout</NavLink></li>
                                </ul>
                            )}
                            {!this.state.signedIn && (
                                <ul className="nav navbar-nav navbar-right" id="checkLogin">
                                    <li><NavLink exact to="/Login">Login</NavLink></li>
                                    <li><NavLink exact to="/Register">Create Account</NavLink></li>
                                </ul>
                            )}
                        </div>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                        </div>
                        <div className="col-md-8 text-center">
                            <h3>Write a Review</h3>
                            <br/>
                            <div>
                                <select className="form-control" name="businessID" ref="businessID" id="inputBusiness" value={this.state.businessID} onChange={e => this.inputChange(e)}>
                                    <option value="" selected disabled hidden>Choose Business</option>
                                    {this.state.business.map(business =>
                                        <option value={business.businessID}>{business.companyName}</option>
                                    )}
                                </select>
                                <input className="form-control" name="reviewTitle" ref="reviewTitle" type="text" id="inputReviewTitle" placeholder="ReviewTitle" value={this.state.reviewTitle} onChange={e => this.inputChange(e)}/>
                                <textarea className="form-control" id="textArea" rows="7" cols="50" name = "reviewText" value={this.state.reviewText} onChange={e => this.inputChange(e)} placeholder="Fix sizings"></textarea>
                            </div>
                            <div>
                                <button className="btn btn-success" onClick={this.Test}>Test</button>
                                <button className="btn btn-warning" onClick={this.Submit}>Submit</button>
                            </div>
                            <br/><br/>
                            <div>
                                <h2 id="text">Add to training set</h2>
                                <label htmlFor="inputUsername" className="col-md-2 control-label">Star Rating</label>
                                <div className="col-md-10">
                                    <input className="form-control" name="starRating" ref="starRating" type="text" id="inputStar" placeholder="Star Rating (1 - 5)" value={this.state.starRating} onChange={e => this.inputChange(e)}/>
                                </div>
                                <div>
                                    <button className="btn btn-info" onClick={this.Export}>Export</button>
                                    <button className="btn btn-danger" onClick={this.Train}>Train</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.state.redirectOnLogout && (
                        <Redirect push to={{pathname: "/Login"}}/>
                    )}
                    {this.state.redirectToBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                    )}
                    {this.state.redirect && (
                        <Redirect push to="/Login"/>
                    )}
                    {this.state.redirectSearchTerm && (
                        <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                    )}
                    {this.state.redirectOnInitialPage && (
                        <Redirect push to={{pathname: "/"}}/>
                    )}
                </div>
            </div>
        );
    }
}

export default AdminReviewPage;