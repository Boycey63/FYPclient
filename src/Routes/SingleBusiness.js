import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import Link from "valuelink/lib/index";
import axios from "axios/index";
import L from "leaflet";
import { Input, TextArea, Select} from 'valuelink/tags';

const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';
let jwt = require('jsonwebtoken');
let map,marker;
let iconImage = require('../Images/business.png');


// specify popup options
let customOptions =
    {
        'maxWidth': '550',
        'className' : 'custom'
    };

let businessIcon = L.icon({
    iconUrl: iconImage,
    iconSize: [40,45],
    iconAnchor: [20, 43],
    popupAnchor: [1, -38],
});

class SingleBusiness extends Component {

    constructor() {
        super();
        this.state = {
            signedIn: false,
            userDetails: [],
            companyDetails: [],
            reviewDetails: [],
            lat:0,
            lng:0,
            address:'',
            zoom: 16,
            maxZoom: 18,
            minZoom:1,
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            userLocation:'',
            noReviews: false,
            noReviewsFilter: false,
            reviewTitle: '',
            reviewText: '',
            starRating: '',
            displayError: false,
            displayComplete: false,
            filterValue: '',
            currentFilter: '',
            averageRating: '',
            updated: false,
            searchTerm: '',
            redirectSearchTerm: false,
            processingReview: false,
        };
    }

    componentDidMount() {
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


        if (retrievedObject === null) {
            self.setState({signedIn: false});
        } else {
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers: {
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                if (res.data === "pass") {
                    self.setState({userDetails: jwt.decode(tokenValue.token)});
                    self.setState({signedIn: true});
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
                } else {
                    self.setState({signedIn: false});
                    document.getElementById("checkLogin").style.visibility = "visible";
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).catch(function (error) {
                alert(error);
            });
        }


        axios({
            method: 'post',
            url: '/select/oneBusiness',
            data: {
                companyName: self.props.match.params.business,
            }
        }).then(function (res) {
            self.setState({
                companyDetails: res.data,
                lat: res.data[0].latitude,
                lng: res.data[0].longitude,
                address: res.data.address
            });
        });

        //Selects reviews of single business
        axios({
            method: 'post',
            url: '/select/businessReviews',
            data: {
                companyName: this.props.match.params.business,
            }
        }).then(function (res) {
            if(res.data === 'No reviews found'){
                self.setState({
                    noReviews: true,
                });
            }else {
                self.setState({
                    reviewDetails: res.data,
                });
            }
        });

        //Get the average star rating
        axios({
            method: 'post',
            url: '/select/averageRating',
            data: {
                companyName: this.props.match.params.business,
            }
        }).then(function (res) {
            if(res.data === 'No reviews found'){
                self.setState({
                    noReviews: true,
                    averageRating: '0',
                });
            }else {
                self.setState({
                    averageRating: res.data[0].starAverage,
                });
            }
        });
    };

    componentDidUpdate(){
        document.getElementById("checkLogin").style.visibility = "visible";
    }

    showHidemap = (checkedId) =>{
        if(document.getElementById(checkedId).checked){
            let newDiv = document.createElement("div");
            newDiv.setAttribute("id","map");
            let container = document.getElementById("mapContainer2");
            container.style.display ="flex";
            container.style.justifyContent ="center";

            container.appendChild(newDiv);
            this.showMap();
        }else{
            let mapDiv = document.getElementById("mapContainer2");
            mapDiv.removeChild(mapDiv.firstChild);
        }
    };

    showMap = () => {
        let southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        let bounds = L.latLngBounds(southWest, northEast);

        map = L.map('map',{minZoom:this.state.minZoom,maxZoom:this.state.maxZoom, maxBoundsViscosity: 1.0, maxBounds: bounds, animate:true}).setView([this.state.lat,this.state.lng], this.state.zoom);
        map.on('drag', function() {
            map.panInsideBounds(bounds, { animate: false });
        });

        L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([this.state.lat,this.state.lng],{icon: businessIcon}).addTo(map);
        marker.bindPopup(this.state.companyDetails[0].address, customOptions).openPopup();
        document.getElementById("map").scrollIntoView();
    };

    removeMap = () => {
        document.getElementById("map").style.visibility = "hidden";
    };

    getStars = (starRating) =>{
        let starValue = starRating;
        if(starValue.toString() === "0"){
            return <div><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span><span className="fa fa-star"></span></div>;
        }
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

    //Submits user review
    onSubmit = () =>{
        let self = this;
        let successTimer = ()=>{
            self.setState({
                displaySuccess: false,
            });
        };

        let errorTimer = ()=>{
            self.setState({
                displayError: false,
            });
        };

        self.setState({
            processingReview: true,
        });

        axios({
            method: 'post',
            url: '/classify/test',
            data: {
                text: this.state.reviewText
            }
        }).then(function (res) {
            if(res.data.length > 0) {
                self.setState({
                    starRating:res.data,
                });

                axios({
                    method: 'post',
                    url: '/insert/review',
                    data: {
                        reviewTitle: self.state.reviewTitle.replace(/'/g, ''),
                        Stars: self.state.starRating,
                        ReviewText: self.state.reviewText.replace(/'/g, ''),
                        businessID: self.state.companyDetails[0].businessID,
                        userID: self.state.userDetails.user.id,
                    }
                }).then(function (response) {
                    if(response.data === 'success') {
                        self.setState({
                            processingReview: false,
                            displaySuccess: true,
                        });
                        setTimeout(successTimer, 3000);
                        self.setState({
                            reviewTitle: '',
                            starRating: '',
                            reviewText: '',
                        });
                        axios({
                            method: 'post',
                            url: '/select/businessReviews',
                            data: {
                                companyName: self.state.companyDetails[0].companyName,
                            }
                        }).then(function (res) {
                            if(res.data === 'No reviews found'){
                                self.setState({
                                    noReviews: true,
                                });
                            }else {
                                self.setState({
                                    noReviews: false,
                                    reviewDetails: res.data,
                                });
                                axios({
                                    method: 'post',
                                    url: '/select/averageRating',
                                    data: {
                                        companyName: self.state.companyDetails[0].companyName,
                                    }
                                }).then(function (res) {
                                    if(res.data === 'No reviews found'){
                                        self.setState({
                                            noReviews: true,
                                        });
                                    }else {
                                        self.setState({
                                            averageRating: res.data[0].starAverage,
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else{
                        self.setState({
                            displayError: true,
                        });
                        setTimeout(errorTimer ,3000);
                    }}).catch(function (error) {
                    alert(error);
                });
            }
        }).catch(function (error) {
            alert(error);
        });
    };

    //Changes the filter option
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
        setTimeout(updatedTimer, 1000);
        if(self.state.filterValue !== '') {
            //Finds business with specified star rating
            axios({
                method: 'post',
                url: '/select/businessReviewsFiltered',
                data: {
                    companyName: self.state.companyDetails[0].companyName,
                    filterValue: self.state.filterValue,
                }
            }).then(function (res) {
                if (res.data === 'No reviews found') {
                    self.setState({
                        reviewDetails: res.data,
                        currentFilter: self.state.filterValue,
                        noReviewsFilter: true,
                    });
                } else {
                    self.setState({
                        reviewDetails: res.data,
                        noReviewsFilter: false,
                    });
                }
            });
        }else{
            //If filter is set to default, search all reviews
            axios({
                method: 'post',
                url: '/select/businessReviews',
                data: {
                    companyName: self.state.companyDetails[0].companyName,
                }
            }).then(function (res) {
                if (res.data === 'No reviews found') {
                    self.setState({
                        noReviews: true,
                        currentFilter: self.state.filterValue,
                        noReviewsFilter: false,
                    });
                } else {
                    self.setState({
                        reviewDetails: res.data,
                        noReviewsFilter: false,
                    });
                }
            });
        }
    };

    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        let titleWordsCount = this.state.reviewTitle.trim().split(/\s+/);
        let reviewWordsCount = this.state.reviewText.trim().split(/\s+/);
        const reviewTitle = Link.state(this, 'reviewTitle')
            .check( x => x, 'A review title is required')
            .check( x => titleWordsCount.length >= 5, 'Title must have at least 5 words')
            .check( x => titleWordsCount.length <= 20, 'Title must have less than 20 words');

        const reviewText = Link.state(this, 'reviewText')
            .check( x => x, 'Review text input is required')
            .check( x => reviewWordsCount.length >= 15, 'Title must have at least 15 words')
            .check( x => reviewWordsCount.length <= 150, 'Title must have less than 150 words');
        const searchTerm =Link.state(this, 'searchTerm').check( x => x );
        const filterValue = Link.state(this, 'filterValue');

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
                    </div>
                </nav>

                <br/>
                <div className="container-fluid">
                    {this.state.companyDetails.map(companyDetails =>
                        <div className="row">
                        <div className="col-md-2" id="text">
                        </div>
                        <div className="col-md-8">
                            <div className="panel-group">
                                <div className="panel  panel-primary">
                                    <div className="panel-heading">
                                        <div className="panel-title text-center">
                                            <h3 key ={companyDetails.businessID}>{companyDetails.companyName}</h3>
                                        </div>
                                    </div>

                                    <div className="panel-body">
                                        <ul className="nav nav-tabs">
                                            <li className ="active"><a href="#details" data-toggle="tab">Details</a></li>
                                            <li><a href="#reviews" data-toggle="tab">Reviews</a></li>
                                            <li><a href="#openclosed" data-toggle="tab">Opening Times</a></li>
                                            {this.state.userType === 1 &&
                                                <li><a href="#makeReview" data-toggle="tab">Make a Review</a></li>
                                            }
                                            {this.state.userType === 3&&
                                                <li><a href="#makeReview" data-toggle="tab">Make a Review</a></li>
                                            }
                                        </ul>
                                        <div className="table-responsive">
                                            <p className="hidden-lg hidden-md hidden-sm visible-xs">Scroll left to see content</p>
                                            <div id="myTabContent" className="tab-content">
                                                <div className="tab-pane active" id="details">
                                                    <br/>
                                                    <table className="table table-striped" id="showborder">
                                                        <tbody>
                                                            <tr>
                                                                <th className="info text-center" colSpan="4">Business Details</th>
                                                            </tr>
                                                            <tr>
                                                                <th width="25%">Business Owner</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.ownerName}</td>
                                                                <th width="25%">Business Type</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.categoryName}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Year Established</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.formYearEst}</td>
                                                                <th>Business Number</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.companyNum}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Business Email</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.companyEmail}</td>
                                                                <th>Added to the website</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.formCreationDate}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Address</th>
                                                                <td key ={companyDetails.businessID}>{companyDetails.address}</td>
                                                                <th>Average Rating</th>
                                                                <td>{this.getStars(Math.round(this.state.averageRating))}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Business Description</th>
                                                                <td colSpan="2" key ={companyDetails.userID}>{companyDetails.description}</td>
                                                                <td colSpan="1">
                                                                    <label className="switch pull-right">
                                                                        <input className="switch-input" type="checkbox" id="checkbox" onClick={this.showHidemap.bind(this,'checkbox')}/>
                                                                        <span className="switch-label" data-on="Hide Map" data-off="Show Map"></span>
                                                                        <span className="switch-handle"></span>
                                                                    </label>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <div id="mapContainer2">
                                                    </div>
                                                </div>

                                                <div className="tab-pane fade" id="reviews">
                                                    <br/>
                                                    <div className="container-fluid">
                                                        {this.state.noReviews && (
                                                            <div>
                                                                <div className="col-md-1"></div>
                                                                <div className="col-md-10">
                                                                    <div className="alert alert-danger text-center">
                                                                        <strong>No reviews found for this business!</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!this.state.noReviews && (
                                                            <div className="row">
                                                                <div className="col-md-2"></div>
                                                                <div className="col-md-8">
                                                                    <label>Filter by Rating</label>
                                                                    <div className="input-group">
                                                                        <Select className="form-control" valueLink={filterValue}>
                                                                            <option value="" selected>No Filter</option>
                                                                            <option value="1">1 Star</option>
                                                                            <option value="2">2 Star</option>
                                                                            <option value="3">3 Star</option>
                                                                            <option value="4">4 Star</option>
                                                                            <option value="5">5 Star</option>
                                                                        </Select>
                                                                        <span className="input-group-btn"><input type="button" className="btn btn-warning" onClick={this.filterChange} value="Update"/></span>
                                                                    </div>
                                                                    {this.state.updated && (
                                                                        <div className="row">
                                                                            <h6 className="text-success text-center"><strong>Updated!</strong></h6>
                                                                        </div>
                                                                    )}
                                                                    <br/>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {this.state.noReviewsFilter && (
                                                            <div className="row">
                                                                <div className="col-md-1"></div>
                                                                <div className="col-md-10">
                                                                    <div className="alert alert-danger text-center">
                                                                        <strong>No reviews found with {this.state.currentFilter} stars!</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!this.state.noReviewsFilter && (
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                {this.state.reviewDetails.map(reviewDetails =>
                                                                    <table className="table table-striped" id="showborder">
                                                                        <tbody>
                                                                            <tr className="info">
                                                                                <th width="20%">Title</th>
                                                                                <th key={reviewDetails.ReviewID}>{reviewDetails.ReviewTitle}</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Reviewer</th>
                                                                                <td key={reviewDetails.ReviewID}>{reviewDetails.username}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Review Date</th>
                                                                                <td key={reviewDetails.ReviewID}>{reviewDetails.formReviewDate}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Star Rating</th>
                                                                                <td key={reviewDetails.ReviewID}>{this.getStars(reviewDetails.Stars)}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Review Text</th>
                                                                                <td key={reviewDetails.ReviewID}>{reviewDetails.ReviewText}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="tab-pane fade" id="openclosed">
                                                    <br/>
                                                    <table className="table table-striped">
                                                        <tbody id="showborder">
                                                            <tr className="info">
                                                                <th width="20%">Day</th>
                                                                <th>Times</th>
                                                            </tr>
                                                            <tr>
                                                                <th>Monday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.monday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Tuesday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.tuesday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Wednesday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.wednesday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Thursday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.thursday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Friday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.friday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Saturday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.saturday}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Sunday:</th>
                                                                <td key ={companyDetails.openHoursID}>{companyDetails.sunday}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="tab-pane fade" id="makeReview">
                                                    <br/>
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        {this.state.displayError &&(
                                                            <div className="alert alert-dismissible alert-danger text-center">
                                                                <strong>Couldn't get a star rating based off you review, Please try to give more detail!</strong>
                                                            </div>
                                                        )}

                                                        {this.state.displaySuccess &&(
                                                            <div className="alert alert-dismissible alert-success text-center">
                                                                <strong>Your review was successful, to see it go to the review tab!<h3><span role="img" aria-label="">&#x2705;</span></h3></strong>
                                                            </div>
                                                        )}

                                                        {this.state.processingReview &&(
                                                            <div>
                                                                <div className="text-center">
                                                                    <h4>Your Review is being processed!</h4>
                                                                    <p>This could take a second or two</p>
                                                                    <div id="processReview">
                                                                        <div className="progress progress-striped active"  style={{width:'80%',"marginLeft":'auto',"marginRight":'auto'}}>
                                                                            <div className="progress-bar progress-bar-success"  style={{width:'100%'}}></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}


                                                        {!this.state.displaySuccess && !this.state.processingReview &&(
                                                            <div>
                                                                <div className="row">
                                                                    <label htmlFor="reviewTitle" className="control-label">Review Title</label>
                                                                    <Input className="form-control" id="reviewTitle" valueLink={reviewTitle} type="text" placeholder="ReviewTitle"/>
                                                                    <small id="reviewTitleHelp" className="text-danger">{reviewTitle.error}</small>
                                                                </div>

                                                                <div className="row">
                                                                    <label htmlFor="reviewText" className="control-label">Review Text</label>
                                                                    <TextArea className="form-control" rows="7" cols="50" id="textArea" valueLink={reviewText} placeholder="Type your review here..."/>
                                                                    <small id="reviewTextHelp" className="text-danger">{reviewText.error}</small>
                                                                </div>
                                                                <br/>
                                                                <div className="row">
                                                                    <div className="text-center">
                                                                        <button className="btn btn-success" disabled={reviewTitle.error || reviewText.error} onClick={this.onSubmit}>Submit</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                {this.state.redirectOnLogout && (
                    <Redirect push to={{pathname: "/Login"}}/>
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
        );
    }
}

export default SingleBusiness;