import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import Link from "valuelink/lib/index";
import axios from "axios/index";
import { Input, Select, TextArea } from 'valuelink/tags';
import L from "leaflet";

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

class MyBusiness extends Component {
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
            zoom: 15,
            maxZoom: 16,
            minZoom:1,
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            userLocation:'',
            noReviews: false,
            noBusiness: false,
            redirectCreateBus: false,
            averageRating: '',
            searchTerm: '',
            redirectSearchTerm: false,
            updateSuccess: false,
            delete: false,
            deleted: false,
            update: false,
            companyName: '',
            ownerName: '',
            yearEst: '',
            companyType: '',
            companyNum: '',
            companyEmail: '',
            description: '',
            location: '',
            latitude:0,
            longitude:0,
            category:'',
            mondayO: '',
            mondayC: '',
            tuesdayO: '',
            tuesdayC: '',
            wednesdayO: '',
            wednesdayC: '',
            thursdayO: '',
            thursdayC: '',
            fridayO: '',
            fridayC: '',
            saturdayO: '',
            saturdayC: '',
            sundayO: '',
            sundayC: '',
            currentDate : new Date().toISOString().split('T')[0],
            categorys: '',
            pressed: false,
            errorMessage: '',
            error: false,
            redirectHome: false,
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
                    if (self.state.userDetails.user.userType === 1) {
                        self.setState({
                            userType: 1,
                        });
                    }
                    if (self.state.userDetails.user.userType === 2) {
                        self.setState({
                            userType: 2,
                        });
                    }
                    if (self.state.userDetails.user.userType === 3) {
                        self.setState({
                            userType: 3,
                        });
                    }
                } else {
                    self.setState({signedIn: false});
                    document.getElementById("checkLogin").style.visibility = "visible";
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).then(function (res) {
                axios({
                    method: 'post',
                    url: '/select/userBusiness',
                    data: {
                        userID: self.state.userDetails.user.id,
                    }
                }).then(function (res) {
                    if(res.data.length > 0) {
                        let monday = res.data[0].monday.split("-");
                        let tuesday = res.data[0].tuesday.split("-");
                        let wednesday = res.data[0].wednesday.split("-");
                        let thursday = res.data[0].thursday.split("-");
                        let friday = res.data[0].friday.split("-");
                        let saturday = res.data[0].saturday.split("-");
                        let sunday = res.data[0].sunday.split("-");
                        self.setState({
                            companyDetails: res.data,
                            lat: res.data[0].latitude,
                            lng: res.data[0].longitude,
                            address: res.data.address,
                            companyName: res.data[0].companyName,
                            ownerName: res.data[0].ownerName,
                            yearEst: res.data[0].formYearEst3,
                            companyType: res.data[0].companyType,
                            category: res.data[0].categoryID,
                            description: res.data[0].description,
                            location: res.data[0].address,
                            latitude:res.data[0].latitude,
                            longitude:res.data[0].longitude,
                            mondayO: monday[0],
                            mondayC: monday[1],
                            tuesdayO: tuesday[0],
                            tuesdayC: tuesday[1],
                            wednesdayO: wednesday[0],
                            wednesdayC: wednesday[1],
                            thursdayO: thursday[0],
                            thursdayC: thursday[1],
                            fridayO: friday[0],
                            fridayC: friday[1],
                            saturdayO: saturday[0],
                            saturdayC: saturday[1],
                            sundayO: sunday[0],
                            sundayC: sunday[1],
                        });
                    }else{
                        self.setState({
                            noBusiness:true,
                        });
                    }
                }).then(function (res) {
                    axios({
                        method: 'post',
                        url: '/select/businessReviews',
                        data: {
                            companyName:  self.state.companyDetails.companyName,
                        }
                    }).then(function (res) {
                        if(res.data === 'No reviews found'){
                            self.setState({
                                noReviews: true,
                            });
                            axios({
                                method: 'post',
                                url: '/select/averageRating',
                                data: {
                                    companyName: self.state.companyDetails.companyName,
                                }
                            }).then(function (res) {
                                if(res.data === 'No reviews found'){
                                    self.setState({
                                        averageRating: '0',
                                    });
                                }else {
                                    self.setState({
                                        averageRating: res.data[0].starAverage,
                                    });
                                }
                            });
                        }else {
                            self.setState({
                                reviewDetails: res.data,
                            });
                        }
                    });
                });
            }).catch(function (error) {
                console.log(error);
            });
        }

        axios({
            method: 'get',
            url: '/select/categories',
        })
            .then(function (res) {
                self.setState({categorys: res.data});
            })
            .catch(function (error) {
                console.log(error);
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

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([this.state.lat,this.state.lng],{icon: businessIcon}).addTo(map);
        marker.bindPopup(this.state.companyDetails[0].address, customOptions).openPopup();
        document.getElementById("map").scrollIntoView();
    };

    removeMap = () => {
        document.getElementById("map").style.visibility = "hidden";
    };

    createBusiness = () =>{
        this.setState({
            redirectCreateBus: true,
        });
    };

    search =()=>{
        if(this.state.pressed === false){
            this.setState({
                pressed:true,
            });
        }

        axios({
            method:'get',
                baseURL:'https://maps.googleapis.com/maps/api/geocode/json?address='+this.state.location + '&key=' + apikey,
        }).then(res => {
            if(res.data.results.length > 0) {
                this.setState({
                    location: '',
                });
                this.setState({
                    latitude: res.data.results[0].geometry.location.lat,
                    longitude: res.data.results[0].geometry.location.lng,
                    address: res.data.results[0].formatted_address,
                    location: res.data.results[0].formatted_address,
                });
            }else{
                this.setState({
                    location:'',
                    pressed:false,
                });
                document.getElementById("inputLocation").placeholder="Either no input or address doesn't exist";
            }
        });
    };

    //Returns the visual star rating to be displayed
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

    //Updates the user data
    onSubmit = (e) => {
        e.preventDefault();
        let self = this;
        if(self.state.yearEst < document.getElementById("date").max) {

            let updateSuccess = () => {
                this.setState({
                    updateSuccess: false,
                    update: false,
                });
            };
            let updateError = () => {
                this.setState({
                    error: false,
                    errorMessage: '',
                });
            };
            //Checks if company name is taken
            axios({
                method: 'post',
                url: '/select/checkCompanyName',
                data: {
                    companyName: self.state.companyName,
                    companyID: self.state.companyDetails[0].businessID,
                }
            }).then(function (res) {
                if (res.data === "exists") {
                    self.setState({
                        errorMessage: 'Company Name already exists...Please update your input and submit again',
                        error: true,
                        companyName: '',
                    });
                    setTimeout(updateError, 2500);
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                } else {
                    //Sends data to server for updating
                    axios({
                        method: 'post',
                        url: '/update/CompanyDetails',
                        data: {
                            companyID: self.state.companyDetails[0].businessID,
                            companyName: self.state.companyName,
                            ownerName: self.state.ownerName,
                            yearEst: self.state.yearEst,
                            companyNum: self.state.companyNum,
                            companyEmail: self.state.companyEmail,
                            description: self.state.description,
                            address: self.state.location,
                            latitude: self.state.latitude,
                            longitude: self.state.longitude,
                            monday: self.state.mondayO + "-" + self.state.mondayC,
                            tuesday: self.state.tuesdayO + "-" + self.state.tuesdayC,
                            wednesday: self.state.wednesdayO + "-" + self.state.wednesdayC,
                            thursday: self.state.thursdayO + "-" + self.state.thursdayC,
                            friday: self.state.fridayO + "-" + self.state.fridayC,
                            saturday: self.state.saturdayO + "-" + self.state.saturdayC,
                            sunday: self.state.sundayO + "-" + self.state.sundayC,
                        }
                    }).then(function (res) {
                        if (res.data === "success") {
                            self.setState({
                                updateSuccess: true,
                                companyNum: '',
                                companyEmail: '',
                            });
                            setTimeout(updateSuccess, 2000);

                            //Updates teh Open hours
                            axios({
                                method: 'post',
                                url: '/select/userBusiness',
                                data: {
                                    userID: self.state.userDetails.user.id,
                                }
                            }).then(function (res) {
                                if (res.data.length > 0) {
                                    let monday = res.data[0].monday.split("-");
                                    let tuesday = res.data[0].tuesday.split("-");
                                    let wednesday = res.data[0].wednesday.split("-");
                                    let thursday = res.data[0].thursday.split("-");
                                    let friday = res.data[0].friday.split("-");
                                    let saturday = res.data[0].saturday.split("-");
                                    let sunday = res.data[0].sunday.split("-");

                                    self.setState({
                                        companyDetails: res.data,
                                        lat: res.data[0].latitude,
                                        lng: res.data[0].longitude,
                                        address: res.data.address,
                                        companyName: res.data[0].companyName,
                                        ownerName: res.data[0].ownerName,
                                        yearEst: res.data[0].formYearEst3,
                                        companyType: res.data[0].companyType,
                                        category: res.data[0].categoryID,
                                        description: res.data[0].description,
                                        location: res.data[0].address,
                                        latitude: res.data[0].latitude,
                                        longitude: res.data[0].longitude,
                                        mondayO: monday[0],
                                        mondayC: monday[1],
                                        tuesdayO: tuesday[0],
                                        tuesdayC: tuesday[1],
                                        wednesdayO: wednesday[0],
                                        wednesdayC: wednesday[1],
                                        thursdayO: thursday[0],
                                        thursdayC: thursday[1],
                                        fridayO: friday[0],
                                        fridayC: friday[1],
                                        saturdayO: saturday[0],
                                        saturdayC: saturday[1],
                                        sundayO: sunday[0],
                                        sundayC: sunday[1],
                                    });
                                } else {
                                    self.setState({
                                        noBusiness: true,
                                    });
                                }
                            }).then(function (res) {
                                //Reselects the business companys reviews
                                axios({
                                    method: 'post',
                                    url: '/select/businessReviews',
                                    data: {
                                        companyName: self.state.companyDetails.companyName,
                                    }
                                }).then(function (res) {
                                    if (res.data === 'No reviews found') {
                                        self.setState({
                                            noReviews: true,
                                        });
                                        axios({
                                            method: 'post',
                                            url: '/select/averageRating',
                                            data: {
                                                companyName: self.state.companyDetails.companyName,
                                            }
                                        }).then(function (res) {
                                            if (res.data === 'No reviews found') {
                                                self.setState({
                                                    averageRating: '0',
                                                });
                                            } else {
                                                self.setState({
                                                    averageRating: res.data[0].starAverage,
                                                });
                                            }
                                        });
                                    } else {
                                        self.setState({
                                            reviewDetails: res.data,
                                        });
                                    }
                                });
                            });
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            });
        }else{
            document.getElementById("yearEstError").innerHTML = "Date must be before todays date";
        }
    };

    //Deletes the busines from the database
    deleteBusiness = () =>{
        let self = this;

        let deleteSuccess = () =>{
            this.setState({
                redirectHome: true,
            });
        };

        axios({
            method: 'post',
            url: '/delete/business',
            data: {
                companyID: self.state.companyDetails[0].businessID,
            }
        }).then(function (res) {
            if(res.data === "success"){
                self.setState({
                    deleted: true,
                });
                //Redirects to the homepage
                setTimeout(deleteSuccess, 3000);
            }
        });
    };

    delete = () =>{
        this.setState({
            delete: true,
        })
    };

    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    updateDetails = () =>{
        this.setState({
            update: true,
        })
    };

    noChange = () =>{
        this.setState({
            update: false,
            delete: false,
        })
    };

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };


    render() {
        const searchTerm =Link.state(this, 'searchTerm').check( x => x );
        const ownerName = Link.state(this, 'ownerName')
            .check( x => x ,'Required field')
            .check( x => x.match(/^[A-Za-z ]+$/) ,'Owners name should only have letters')
            .check( x => x.length >= 2, 'Username must have more than 2 characters');
        const companyNum = Link.state(this, 'companyNum')
            .check( x => x ,'Required field')
            .check( x => !isNaN(x) ,'Phone Number must be only numbers')
            .check( x => x.length === 10 ,'Phone Number must be 10 digits long');
        const companyEmail = Link.state(this, 'companyEmail')
            .check( x => x ,'Required field')
            .check( x => x.indexOf(' ') < 0,"Name shouldn't contain spaces")
            .check( x => x.match('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), 'Must be a valid email, no capital letters e.g. example@gmail.com');
        const companyName = Link.state(this, 'companyName')
            .check( x => x ,'Required field')
            .check( x => x.length <= 30, 'Company name must have more than 30 characters');
        const yearEst = Link.state(this, 'yearEst')
            .check( x => x ,'Required field');
        const category = Link.state(this, 'category')
            .check( x => x ,'Required field');
        const location = Link.state(this, 'location')
            .check( x => x ,'Required field')
            .check( x => this.state.pressed !== false,'Must press the search button');
        const description = Link.state(this, 'description');
        const mondayO = Link.state(this, 'mondayO');
        const mondayC = Link.state(this, 'mondayC');
        const tuesdayO = Link.state(this, 'tuesdayO');
        const tuesdayC = Link.state(this, 'tuesdayC');
        const wednesdayO = Link.state(this, 'wednesdayO');
        const wednesdayC = Link.state(this, 'wednesdayC');
        const thursdayO = Link.state(this, 'thursdayO');
        const thursdayC = Link.state(this, 'thursdayC');
        const fridayO = Link.state(this, 'fridayO');
        const fridayC = Link.state(this, 'fridayC');
        const saturdayO = Link.state(this, 'saturdayO');
        const saturdayC = Link.state(this, 'saturdayC');
        const sundayO = Link.state(this, 'sundayO');
        const sundayC = Link.state(this, 'sundayC');

        return (
            <div>
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
                        <div className="col-xs-12 col-sm-12 col-md-12">
                            <div className="row">
                                <div className="col-md-2" id="text">
                                </div>
                                <div className="col-md-8">
                                    {this.state.noBusiness &&(
                                        <div id="transparentBack">
                                            <h4 className="text-center">You have not made a business yet !</h4>
                                            <br/>
                                            <button className="btn btn-danger center-block" onClick={this.createBusiness}>Create Business</button>
                                        </div>
                                    )}
                                    {!this.state.noBusiness && !this.state.update && !this.state.delete && !this.state.deleted &&(
                                        <div>
                                            <h3 className="text-center">My Business</h3>
                                            <br/>
                                            <div className="panel-group">
                                                <div className="panel  panel-primary">
                                                    <div className="panel-heading">
                                                        <div className="panel-title">
                                                            {this.state.companyDetails.map(companyDetails =>
                                                                <h3 className="text-center" key ={companyDetails.businessID}>{companyDetails.companyName}</h3>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="panel-body">
                                                        <ul className="nav nav-tabs">
                                                            <li className ="active"><a href="#details" data-toggle="tab">Details</a></li>
                                                            <li><a href="#reviews" data-toggle="tab">Reviews</a></li>
                                                            <li><a href="#openclosed" data-toggle="tab">Opening Times</a></li>
                                                        </ul>
                                                        <div className="table-responsive">
                                                            <p className="hidden-lg hidden-md hidden-sm visible-xs">Scroll left to see content</p>
                                                            <div id="myTabContent" className="tab-content">
                                                                {this.state.companyDetails.map(companyDetails =>
                                                                    <div className="tab-pane active" id="details">
                                                                        <br/>
                                                                        <table className="table table-striped" id="showborder">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <th className="info text-center" colSpan="4"><small>Business Details</small></th>
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

                                                                        <div className="text-center">
                                                                            <div className="btn-group">
                                                                                <button className="btn btn-success" onClick={this.updateDetails}>Update</button>
                                                                                <button className="btn btn-danger" onClick={this.delete}>Delete</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}


                                                                <div className="tab-pane" id="reviews">
                                                                    <br/>
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
                                                                {this.state.companyDetails.map(companyDetails =>
                                                                    <div className="tab-pane" id="openclosed">
                                                                        <br/>
                                                                        <table className="table table-striped">
                                                                            <tbody id="showborder">
                                                                            <tr className="info">
                                                                                <th width="20%">Day</th>
                                                                                <th>Times</th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Monday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.monday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Tuesday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.tuesday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Wednesday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.wednesday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Thursday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.thursday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Friday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.friday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Saturday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.saturday}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>Sunday:</th>
                                                                                <td key ={companyDetails.businessID}>{companyDetails.sunday}</td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.delete && !this.state.deleted &&(
                                        <div>
                                            <br/>
                                            <div className="col-md-2"></div>
                                            <div className="col-md-8">
                                                <div className="panel panel-primary">
                                                    <div className="panel-heading">
                                                        <h3 className="panel-title text-center">{this.state.username2}</h3>
                                                    </div>
                                                    <div className="panel-body text-center">

                                                        <div className="alert alert-danger text-center">
                                                            <strong>Are you sure you want to delete your business!<h3><span role="img" aria-label="success">&#x270B;</span></h3></strong>
                                                            <button className="btn btn-warning" onClick={this.deleteBusiness}>Delete</button>
                                                        </div>

                                                        <button className="btn btn-primary text-center" onClick={this.noChange}>Go Back</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.deleted &&(
                                        <div>
                                            <br/>
                                            <div className="col-md-2"></div>
                                            <div className="col-md-8">
                                                <div className="panel panel-primary">
                                                    <div className="panel-heading">
                                                        <h3 className="panel-title text-center">Say Bye to {this.state.companyName}</h3>
                                                    </div>
                                                    <div className="panel-body text-center">
                                                        <div className="alert alert-danger text-center">
                                                            <strong>Your business has been deleted,<br/> Best say your last good byes!<h3>&#x2639;</h3></strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.update &&(
                                        <div className="row">
                                            <div className="panel panel-primary">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title text-center">Update account</h3>
                                                </div>
                                                <div className="panel-body">
                                                    {this.state.error &&(
                                                        <div className="alert alert-dismissible alert-danger text-center">
                                                            <strong>{this.state.errorMessage}</strong>
                                                        </div>
                                                    )}

                                                    {!this.state.updateSuccess && (
                                                        <div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputOwnerName" className="control-label">Owner's Name</label>
                                                                    <Input className="form-control" id="ownerName" valueLink={ownerName} type="text" placeholder="Owner Name"/>
                                                                    <small className="text-danger">{ownerName.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputCompName" className="control-label">Company Name</label>
                                                                    <Input className="form-control" id="companyName" valueLink={companyName} type="text" placeholder="Company Name"/>
                                                                    <small className="text-danger" id="invalidInput">{companyName.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputCompanyEmail" className="control-label">Owner's Email</label>
                                                                    <Input className="form-control" id="companyEmail" valueLink={companyEmail} type="text" placeholder={this.state.companyDetails[0].companyEmail}/>
                                                                    <small className="text-danger">{companyEmail.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputCompanyNum" className="control-label">Owner's Number</label>
                                                                    <Input className="form-control" id="companyNum" valueLink={companyNum} type="text"  placeholder={this.state.companyDetails[0].companyNum}/>
                                                                    <small className="text-danger">{companyNum.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputDateEst" className="control-label">Year Established</label>
                                                                    <Input className="form-control" id="date" type="date" max={this.state.currentDate}  valueLink={yearEst}/>
                                                                    <small className="text-danger" id="yearEstError">{yearEst.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputCompanyType" className="control-label">Company Category</label>
                                                                    <Select className="form-control" valueLink={category}>
                                                                        <option value="" selected hidden>Categories</option>
                                                                        {this.state.categorys.map(category =>
                                                                            <option key = {category.categoryID} value={category.categoryID}>{category.categoryName}</option>
                                                                        )}
                                                                    </Select>
                                                                    <small className="text-danger">{category.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <label htmlFor="inputAddress" className="control-label">Company Address</label>
                                                                    <div className="input-group">
                                                                        <Input className="form-control" id="location" valueLink={location} type="text" placeholder="Address"/>
                                                                        <span className="input-group-btn"><input className="btn btn-info" type="button" disabled={this.state.location === ''} onClick={this.search} value="Search" /></span>
                                                                    </div>
                                                                    <small className="text-danger">{location.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <label htmlFor="inputDescription" className="control-label">Company Description</label>
                                                                    <TextArea className="form-control" id="textArea" valueLink={description} rows="4" placeholder="Description"/>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <br/>
                                                                <div className="col-md-4"></div>
                                                                <div className="col-md-4">
                                                                    <button data-toggle="collapse"  href={"#OpenTimes"} className="btn btn-warning btn-xs center-block">Open Times</button>
                                                                </div>
                                                            </div>
                                                            <div id="OpenTimes" className="row panel-collapse collapse">
                                                                <h6 className="lead text-center">Open/Closing Times</h6>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="Monday" className="col-md-1 control-label">Mon:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputMondayO" valueLink={mondayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{mondayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputMondayC" valueLink={mondayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{mondayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="Tuesday" className="col-md-1 control-label">Tues:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputTuesdayO" valueLink={tuesdayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{tuesdayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputTuesdayC" valueLink={tuesdayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{tuesdayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="Wednesday" className="col-md-1 control-label">Wed:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputWednesdayO" valueLink={wednesdayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{wednesdayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputWednesdayC" valueLink={wednesdayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{wednesdayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="Thursday" className="col-md-1 control-label">Thurs:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputThursdayO" valueLink={thursdayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{thursdayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputThursdayC" valueLink={thursdayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{thursdayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="inputOwnerName" className="col-md-1 control-label">Fri:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputFridayO" valueLink={fridayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputFridayC" valueLink={fridayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="inputOwnerName" className="col-md-1 control-label">Sat:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputSaturdayO" valueLink={saturdayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputSaturdayC" valueLink={saturdayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayC.error}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-md-1"></div>
                                                                    <label htmlFor="inputOwnerName" className="col-md-1 control-label">Sun:</label>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputSundayO" valueLink={sundayO} type="time" step="600" placeholder="Opening Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{sundayO.error}</small>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <Input className="form-control" id="inputSundayC" valueLink={sundayC} type="time" step="600" placeholder="Closing Time"/>
                                                                        <small id="ownernameHelp" className="form-text text-muted">{sundayC.error}</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <br/>
                                                            <div className="text-center">
                                                                <div className="btn-group">
                                                                    <button className="btn btn-success" disabled={ownerName.error || companyName.error || yearEst.error || category.error || companyNum.error || companyEmail.error || this.state.pressed === false} onClick={this.onSubmit}>Submit</button>
                                                                    <button className="btn btn-primary" onClick={this.noChange}>Go Back</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {this.state.updateSuccess && (
                                                        <div className="row">
                                                            <div className="col-md-2"></div>
                                                            <div className="col-md-8">
                                                                <div className="alert alert-success text-center">
                                                                    <strong>Update Successful!<h3><span role="img" aria-label="success">&#x2705;</span></h3></strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.redirectOnLogout && (
                    <Redirect push to={{pathname: "/Login"}}/>
                )}

                {this.state.redirectCreateBus && (
                    <Redirect push to={{pathname: "/NewBusiness"}}/>
                )}

                {this.state.redirectSearchTerm && (
                    <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                )}

                {this.state.redirectToBusiness && (
                    <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to={{pathname: "/"}}/>
                )}
                {this.state.redirectHome && (
                    <Redirect push to={{pathname: "/Home"}}/>
                )}
                </div>
        )
    }
}

export default MyBusiness;