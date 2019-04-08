import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import Link from "valuelink/lib/index";
import { Input,Select } from 'valuelink/tags';
import axios from "axios/index";

const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';
let jwt = require('jsonwebtoken');

class MyReviews extends Component {
    constructor() {
        super();
        this.state = {
            signedIn: false,
            userDetails: [],
            companyDetails: [],
            reviewDetails:[],
            listDataFromChild: null,
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            userType: 0,
            userLocation:'',
            business: [],
            filterOption: false,
            location: '',
            latitude: '',
            longitude: '',
            noReviews: false,
            redirectCreateReview: false,
            searchTerm: '',
            redirectSearchTerm: false,
            showFilter: false,
            filterValue: '',
            currentFilter: '',
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
                    if(self.state.userDetails.user.userType === 1){
                        self.setState({
                            userType: 1,
                        });
                    }
                    if(self.state.userDetails.user.userType === 2){
                        self.setState({
                            userType: 2,
                        });
                    }
                    if(self.state.userDetails.user.userType === 3){
                        self.setState({
                            userType: 3,
                        });
                    }
                }else{
                    self.setState({ signedIn: false });
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).then(function (res){
                axios({
                    method: 'post',
                    url: '/select/UserReviews',
                    data:{
                        username: self.state.userDetails.user.username,
                    }
                }).then(function (res) {
                    if(res.data.length > 0) {
                        self.setState({
                            reviewDetails: res.data,
                            showFilter: true,
                        });
                    }else{
                        self.setState({noReviews: true});
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    componentDidUpdate(){
        document.getElementById("checkLogin").style.visibility = "visible";
    }

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    createReview = () =>{
        this.setState({
            redirectCreateReview: true,
        });
    };

    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    //Changes the filter for star rating
    filterChange =() =>{
        let self = this;
        let updatedTimer = ()=>{
            self.setState({
                updated: false,
            });
        };

        self.setState({
            updated: true,
        });
        setTimeout(updatedTimer, 1500);
        if(self.state.filterValue !== '') {
            //Searchs for recent review with specified star rating
            axios({
                method: 'post',
                url: '/select/recentReviewsFiltered',
                data: {
                    filterValue: self.state.filterValue,
                }
            }).then(function (res) {
                if (res.data === 'No reviews found') {
                    self.setState({
                        reviewDetails: [],
                        currentFilter: self.state.filterValue,
                        noReviewsFilter: true,
                    });
                } else {
                    self.setState({
                        reviewDetails: res.data,
                        noReviewsFilter: false,
                    });
                }
            }).catch(function (error) {
                console.log(error);
            });
        }else{
            //If filter value is default, search all reviews
            axios({
                method: 'get',
                url: '/select/ReviewTable',
            }).then(function (res) {
                if(res.data.length > 0) {
                    self.setState({
                        reviewDetails: res.data,
                        noReviewsFilter: false,
                    });
                }else{
                    self.setState({
                        noReviews: true,
                        currentFilter: self.state.filterValue,
                        noReviewsFilter: false,
                    });
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    };

    //Return the visual stars rating to be displayed
    getStars = (starRating) =>{
        let starValue = starRating;
        if(starValue.toString() === "1"){
            return <div><span className="fa fa-star checked"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span></div>;
        }
        if(starValue.toString() === "2"){
            return <div><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span></div>;
        }
        if(starValue.toString() === "3"){
            return <div><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star"></span><span className="fa fa-star"></span></div>;
        }
        if(starValue.toString() === "4"){
            return <div><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star"></span></div>;
        }
        if(starValue.toString() === "5"){
            return <div><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span><span className="fa fa-star checked"></span></div>;
        }
    };

    render() {
        const filterValue = Link.state(this, 'filterValue');
        const searchTerm =Link.state(this, 'searchTerm').check( x => x );

        return (
            <div className="overallPage">
                <nav className="navbar navbar-inverse">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-2" aria-expanded="true">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <NavLink exact to="/Home" className="navbar-brand ">The Little Guys</NavLink>
                    </div>

                    <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-2" aria-expanded="true">

                        <ul className="nav navbar-nav">
                            <li><NavLink exact to="/Home">Home</NavLink> <span className="sr-only">(current)</span></li>
                            <li><NavLink exact to="/RecentReviews">Recent Reviews</NavLink></li>
                            <li><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
                            <li><NavLink exact to="/SearchArea">Search Area</NavLink></li>
                        </ul>

                        <form class="navbar-form navbar-left" role="search">
                            <div className="input-group">
                                <Input type="text" className="form-control" placeholder="Search" valueLink={searchTerm}/>
                                {searchTerm.error &&(
                                    <span className="input-group-btn"><button disabled={searchTerm.error} class="btn btn-default">Submit</button></span>
                                )}
                                {!searchTerm.error &&(
                                    <span className="input-group-btn"><button onClick={this.searchForBusiness} class="btn btn-success">Submit</button></span>
                                )}
                            </div>
                        </form>

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
                </nav>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                            {this.state.showFilter &&(
                                <div>
                                    <label>Filter by Star Rating</label>
                                    <div className="input-group">
                                        <Select className="form-control" valueLink={filterValue}>
                                            <option value="" selected >No Filter</option>
                                            <option value="1">1 Star</option>
                                            <option value="2">2 Star</option>
                                            <option value="3">3 Star</option>
                                            <option value="4">4 Star</option>
                                            <option value="5">5 Star</option>
                                        </Select>
                                        <span className="input-group-btn"><input type="button" className="btn btn-info" onClick={this.filterChange} value="Update"/></span>
                                    </div>
                                    {this.state.updated && (
                                        <div className="row">
                                            <h6 className="text-success text-center"><strong>Updated!</strong></h6>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="col-md-8" id="transparentBack">
                            <h3 className="text-center">My Reviews</h3>
                            <br/>

                            {this.state.noReviews &&(
                                <div  id="transparentBack">
                                    <br/>
                                    <h4 className="text-center">You have not made any reviews yet!</h4>
                                    <br/>
                                    <button className="btn btn-danger center-block" onClick={this.createReview}>Write a Review </button>
                                </div>
                            )}

                            {this.state.noReviewsFilter && (
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-10 alert alert-danger text-center">
                                        <strong>No reviews found with {this.state.currentFilter} stars!</strong>
                                    </div>
                                </div>
                            )}

                            {!this.state.noReviews &&(
                                <div>
                                    {this.state.reviewDetails.map(reviewDetails =>
                                        <div key ={reviewDetails.ReviewID}  className="panel-group">
                                            <div className="panel  panel-primary">
                                                <div className="panel-heading">
                                                    <div className="panel-title">
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <h4 key ={reviewDetails.ReviewID}>{"Title: " + reviewDetails.ReviewTitle}</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="panel-body">
                                                    <p className="hidden-lg hidden-md hidden-sm visible-xs">Scroll left to see content</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-striped" id="showBorder">
                                                            <tbody>
                                                            <tr>
                                                                <td width="20%">Company Name</td>
                                                                <td key ={reviewDetails.ReviewID}>{reviewDetails.companyName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Reviewer</td>
                                                                <td key ={reviewDetails.ReviewID}>{reviewDetails.username}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Review Date</td>
                                                                <td key ={reviewDetails.ReviewID}>{reviewDetails.formReviewDate}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Rating</td>
                                                                <td key ={reviewDetails.ReviewID} >{this.getStars(reviewDetails.Stars)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Review Text</td>
                                                                <td key ={reviewDetails.ReviewID} >{reviewDetails.ReviewText}</td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="text-center">
                                                        <NavLink key ={reviewDetails.ReviewID}  exact to={"/SingleBusiness/" + reviewDetails.companyName} className="btn btn-warning btn-sm">Go To Page</NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {this.state.redirectOnLogout && (
                    <Redirect push to={{pathname: "/Login"}}/>
                )}

                {this.state.redirectCreateReview && (
                    <Redirect push to={{pathname: "/WriteReview"}}/>
                )}

                {this.state.redirectToBusiness && (
                    <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to={{pathname: "/"}}/>
                )}
                {this.state.redirectSearchTerm && (
                    <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                )}
            </div>
        )
    }
}

export default MyReviews;