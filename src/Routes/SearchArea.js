import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "../Routes/CSS/ExtraCss.css";
import L from 'leaflet';
import axios from "axios/index";
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import { Redirect } from 'react-router';
import { Input, Select } from 'valuelink/tags';
import Link from "valuelink/lib/index";
let businessicon = require('../Images/business.png');
let deg2rad = require('deg2rad');

let map,circle, marker, initialMarker , businessLocationLayer;
const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';

// create popup contents
let customPopup = [];

// specify popup options
let customOptions =
    {
        'maxWidth': '230',
        'className' : 'custom'
    };

var businessIcon = L.icon({
    iconUrl: businessicon,
    iconSize: [30,35],
    popupAnchor: [3, -10],
});

let jwt = require('jsonwebtoken');

class SearchArea extends Component {
    constructor() {
        super();
        this.state = {
            signedIn: false,
            userDetails: [],
            categorys: [],
            listDataFromChild: null,
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            zoom: 13,
            maxZoom: 16,
            minZoom:1,
            radius: 0,
            location: '',
            step:100,
            max:5000,
            min:0,
            lat:53.3371436,
            lng:-6.2704253,
            circleborderColour:'#ff0000',
            circlefillColour:'#ff0000',
            bounds1Lat:'',
            bounds1Lng:'',
            bounds2Lat:'',
            bounds2Lng:'',
            mapLoading: false,
            searchAddress: false,
            filterValue: '',
            selectedBusiness: '',
            redirectToSpecifiedBusiness: false,
            displayAddressError: false,
            redirectOnInitialPage: false,
            searchTerm: '',
            redirectSearchTerm: false,
            sliderClicked: false,
            mapClicked: false,
            updated: false,
        };
    }

    //Run when component mounts
    componentDidMount(){
        //Checks if there is a location token
        if(!localStorage.getItem('location')) {
            //If not redirect to the start page
            this.setState({
                redirectOnInitialPage: true,
            });
        }else{
            this.setState({
                userLocation: localStorage.getItem('location'),
            });
        }

        //Gets the authentication token
        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        let location = localStorage.getItem('location');

        //Sets the user to not signed in and changes the navigation bar
        if(retrievedObject === null){
            self.setState({ signedIn: false });
        }else{
            //Send token to backend to be checked for validation
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers:{
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                //Sets the user type for all the user specific functionality
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
            }).catch(function (error) {
                alert(error);
            });
        }

        //Set the GPS configurations
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        //If successfully gets the GPS location
        let success = (pos) => {
            var crd = pos.coords;

            this.map(crd.latitude, crd.longitude);

            if (document.getElementById("currectLocationSelection")) {
                document.getElementById("currectLocationSelection").innerHTML = "Using your GPS location";
            }
            this.setState({
                mapLoading: false
            });
        };
        //If doesn't get the GPS location
        let error = () =>{
            axios({
                method:'get',
                //Calls to Google API with the preset location
                baseURL:'https://maps.googleapis.com/maps/api/geocode/json?address='+ location + '&key=' + apikey,
            }).then(res=>{
                if(res.data.results.length > 0) {
                    this.map(res.data.results[0].geometry.location.lat, res.data.results[0].geometry.location.lng);
                }
                if (document.getElementById("currectLocationSelection")) {
                    document.getElementById("currectLocationSelection").innerHTML = "Using your preset location...GPS tracking was unavailable!";
                }
                //Show map
                this.setState({
                    mapLoading: false
                });
            });
        };

        //Show progress bar
        this.setState({
            mapLoading: true
        });

        //Attempt to get the GPS location
        navigator.geolocation.getCurrentPosition(success, error, options);

        //Get the categories for the server
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
    }

    componentDidUpdate(){
        document.getElementById("checkLogin").style.visibility = "visible";
    }

    //Code relating to map setup
    map = (lat1,lng1) => {
        //Set bounds of map
        let southWest = L.latLng(-89.98155760646617, -180),
            northEast = L.latLng(89.99346179538875, 180);
        let bounds = L.latLngBounds(southWest, northEast);
        let loc;

        //Sets up map container
        let div = document.createElement("div");
        div.setAttribute("id", "map2");
        document.getElementById("mapContainer").appendChild(div);

        //Creates map with configurations
        map = L.map('map2', {
            minZoom: this.state.minZoom,
            maxZoom: this.state.maxZoom,
            maxBoundsViscosity: 1.0,
            maxBounds: bounds,
            animate: true,
        }).setView([lat1, lng1], this.state.zoom);
        //Loads and adds the tiles to the map
        L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        //Gets the latitude and longtitude for the current location from Google API
        axios({
            method: 'get',
            baseURL: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + lat1 + '+' + lng1 + '&key=' + apikey,
        }).then(res => {
            if (res.data.results.length > 0) {
                //Places initial marker on map
                marker = L.marker([lat1, lng1]).bindPopup("<h6 className='lead'><u>Currently selected</u></h6>"+res.data.results[0].formatted_address, customOptions).addTo(map);
                loc = marker.getLatLng();

                this.setState({
                    lat: loc.lat,
                    lng: loc.lng
                });
            }
        });

        //Set map to draggable
        map.on('drag', function () {
            map.panInsideBounds(bounds, {animate: false});
        });

        //Set up on click to map so that markers can be placed
        function onMapClick(e) {
            //Removes markers, marker business layer and circle on click if they exist
            if (initialMarker) {
                map.removeLayer(initialMarker);
            }
            if (marker) {
                map.removeLayer(marker);
            }
            if (circle) {
                map.removeLayer(circle);
            }
            if (businessLocationLayer) {
                map.removeLayer(businessLocationLayer);
            }
            loc = e.latlng;
            //Gets the address for location that was clicked
            axios({
                method: 'get',
                baseURL: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + loc.lat + '+' + loc.lng + '&key=' + apikey,
            }).then(res => {
                if (res.data.results.length > 0) {
                    //Sets the address for the marker and adds marker to map
                    customPopup = "<h6 className='lead'><u>Currently selected</u></h6>"+res.data.results[0].formatted_address;
                    marker = L.marker([loc.lat, loc.lng]).bindPopup(customPopup, customOptions).addTo(map);
                }
            });
            updateLocation();
            map.panTo(e.latlng);
        }

        //Adds the onclick to map
        map.on('click', onMapClick);

        let updateLocation = () => {
            this.setState({
                lat: loc.lat,
                lng: loc.lng,
                radius: 0,
            });
        };
    };

    //Searches the users input location
    search =()=>{
        let updateError = ()=>{
            self.setState({
                displayAddressError: false,
            });
        };

        let self = this;

        //Sends the user input to the Google API
        axios({
            method:'get',
            baseURL:'https://maps.googleapis.com/maps/api/geocode/json?address=',
            url: this.state.location + '&key=' + apikey
        })
            .then(res => {
                if(res.data.results.length > 0) {
                    //Save latitude and longitude
                    this.setState({
                        location: '',
                        lat: res.data.results[0].geometry.location.lat,
                        lng: res.data.results[0].geometry.location.lng,
                    });

                    //Removes markers, markerlayer and circle on click if they exist
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    if (circle) {
                        map.removeLayer(circle);
                    }
                    if (businessLocationLayer) {
                        map.removeLayer(businessLocationLayer);
                    }
                    //The location exists
                    if (res.data.results.length > 0) {
                        //Adds the address to the pop up
                        customPopup = res.data.results[0].formatted_address;
                        //Adds the marker to the map as current location
                        marker = L.marker([this.state.lat, this.state.lng]).bindPopup(customPopup, customOptions).addTo(map);
                        //Changes to the markers location and
                        map.setView([res.data.results[0].geometry.location.lat, res.data.results[0].geometry.location.lng], this.state.maxZoom);
                        document.getElementById("dontShow").style.display = "block";
                        this.setState({
                            radius: 0,
                            searchAddress: false,
                        });
                        document.getElementById("currectLocationSelection").innerHTML = "Using your searched location";
                    }
                }else{
                    //Displays error if the location doesn't exist
                    self.setState({
                        displayAddressError: true,
                        location: '',
                    });
                    setTimeout(updateError, 2500);
                }
            });
    };

    //Control for the slider on the screen
    onSlide = (value) => {
        this.setState({
            radius: value,
        });
        //Remove circle and marker business layer
        if(circle) {
            map.removeLayer(circle);
        }
        if (businessLocationLayer) {
            map.removeLayer(businessLocationLayer);
        }
        //If there is a marker
        if(marker)
        {
            //Add circle to map with the radius of the sider
            circle = L.circle([this.state.lat, this.state.lng], {
                color: this.state.circleborderColour,
                fillColor: this.state.circlefillColour,
                fillOpacity: 0.2,
                radius: this.state.radius
            }).addTo(map);
            //Changes zone of map based on the sider value
            if(this.state.radius < this.state.max/6){
                map.setView([this.state.lat,this.state.lng]);
                map.panTo([this.state.lat,this.state.lng]);
                map.setZoom(15);
            }

            if(this.state.radius > this.state.max/6 && this.state.radius <= this.state.max/4) {
                map.setView([this.state.lat,this.state.lng]);
                map.panTo([this.state.lat,this.state.lng]);
                map.setZoom(14);
            }
            if(this.state.radius > this.state.max/4 && this.state.radius <= this.state.max/2){
                map.setView([this.state.lat,this.state.lng]);
                map.setZoom(13);
            }
            if(this.state.radius > this.state.max/2){
                map.setView([this.state.lat,this.state.lng]);
                map.setZoom(12);
            }

        }
        //If there isn't a marker on the map, set radius to zero
        else{
            this.setState({
                radius: 0
            })
        }
    };

    getbusinesses = () =>{
        //Remove marker business layer of
        if(map.hasLayer(businessLocationLayer)){
            map.removeLayer(businessLocationLayer);
        }

        //This is the Great-circle distance formula used to find the distance of two points on a globe
        //Find the distance between business on the map to the marker
        let getDistanceBetweenPoints = (lat1,lon1,lat2,lon2) => {
            // Radius of the earth in km
            let R = 6371000;
            //Convert angle from degrees to radians
            let dLat = deg2rad(lat2-lat1);
            let dLon = deg2rad(lon2-lon1);
            let a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            let distance = R * c; // Distance in km
            return distance;
        };

        let self = this;
        //Finds all the business on the visible map
        axios({
            method: 'post',
            url: '/select/BusinessLatLng',
            data:{
                //Send the corners of the map to server
                'A_x' : map.getBounds()._northEast.lat,
                'A_y' : map.getBounds()._northEast.lng,
                'B_x' : map.getBounds()._southWest.lat,
                'B_y' : map.getBounds()._southWest.lng,
                'filterValue' : this.state.filterValue,
            }
        }).then(function (res) {
            if(res.data !== "No such business!") {
                businessLocationLayer = L.layerGroup();
                for(let i=0;i < res.data.length; i++){
                    //If the distance between the two points is equal or less, add the business to the business layer
                    if(getDistanceBetweenPoints(res.data[i].latitude, res.data[i].longitude, self.state.lat, self.state.lng) <= self.state.radius) {
                        let popup = L.popup().setContent('<p>'+res.data[i].companyName+'</p>');
                        let markerLocation = new L.LatLng(res.data[i].latitude, res.data[i].longitude);
                        let marker = new L.Marker(markerLocation, {icon: businessIcon}).bindPopup(popup,customOptions).on('popupopen', function () {
                            self.setState({selectedBusiness: res.data[i].companyName});
                            document.getElementById('goToBusinessbutton').scrollIntoView();
                        }).on('popupclose', function () {
                            self.setState({selectedBusiness: ''});
                        });
                        businessLocationLayer.addLayer(marker);
                    }
                }
                //Once for loop is done, display the marker business layer
                map.addLayer( businessLocationLayer );
            }
            else{
                if(map.hasLayer(businessLocationLayer)){
                    map.removeLayer(businessLocationLayer);
                }
            }
        }).catch(function (error) {
            alert(error);
        });
    };

    //This is the function for the filter when changed for categories
    filterChosen = () =>{
        if(circle) {
            map.removeLayer(circle);
        }

        if (businessLocationLayer) {
            map.removeLayer(businessLocationLayer);
        }

        this.setState({
            radius: 0,
            updated: true,
        });

        //Displays update message
        let updatedTimer = ()=>{
            this.setState({
                updated: false,
            });
        };
        setTimeout(updatedTimer, 1500);

    };

    //When a term is searched for in the search bar
    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    //Go back when on the location search page
    back = () =>{
        document.getElementById("dontShow").style.display = "block";

        this.setState({
            searchAddress: false,
        });
    };

    //Go to location search page
    displaySearch = () =>{
        document.getElementById("dontShow").style.display = "none";

        this.setState({
            searchAddress: true,
        })
    };

    //Redirects to selected business
    redirectToBusiness =() =>{
        this.setState({
            redirectToSpecifiedBusiness: true,
        });
    };

    //This changes the colour of the button when clicked for the info on the right
    infoClick = (clicked_id) =>{
        if(clicked_id === "sliderButton") {
            if (!this.state.sliderClicked) {
                document.getElementById(clicked_id).className = "btn btn-default";
                this.setState({
                    sliderClicked: true,
                })
            } else if (this.state.sliderClicked) {
                document.getElementById(clicked_id).className = "btn btn-primary";
                this.setState({
                    sliderClicked: false,
                })
            }
        }
        if(clicked_id === "mapButton") {
            if (!this.state.mapClicked) {
                document.getElementById(clicked_id).className = "btn btn-default";
                this.setState({
                    mapClicked: true,
                })
            } else if (this.state.mapClicked) {
                document.getElementById(clicked_id).className = "btn btn-primary";
                this.setState({
                    mapClicked: false,
                })
            }
        }
    };

    //Logout function
    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        const location = Link.state(this, 'location')
            .check( x => x ,'Required field');
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
                                <li className="active"><NavLink exact to="/SearchArea">Search Area</NavLink></li>
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

                <div className="container-fluid" id="dontShow">
                    <div className="row">
                        <div className="col-md-2" onChange={this.filterChosen}>
                            {!this.state.mapLoading &&(
                                <div>
                                    <label>Filter by Category</label>
                                    <Select className="form-control" valueLink={filterValue}>
                                        <option value="" selected>No Filter</option>
                                        {this.state.categorys.map(category =>
                                            <option key = {category.categoryID} value={category.categoryName}>{category.categoryName}</option>
                                        )}
                                    </Select>
                                </div>
                            )}
                            {this.state.updated && (
                                <div className="row">
                                    <h6 className="text-success text-center"><strong>Updated!</strong></h6>
                                </div>
                            )}
                        </div>
                        <div className="col-md-8" id="transparentBack">
                            <div className="text-center">
                                <h3>Search Area</h3>
                                <small className="text-info" id="currectLocationSelection"></small>
                            </div>
                            {!this.state.mapLoading &&(
                                <div className="row">
                                    <div className="col-md-2">
                                    </div>
                                    <div className="col-md-6">
                                        <Slider
                                            value={this.state.radius}
                                            orientation="horizontal"
                                            onChange={this.onSlide}
                                            step={this.state.step}
                                            min={this.state.min}
                                            max={this.state.max}
                                            onChangeComplete={this.getbusinesses}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                            <button className="btn btn-primary btn-sm center-block" onClick={this.displaySearch}>Search an address</button>
                                    </div>
                                </div>
                            )}
                            <div className="row">
                                <div className="col-md-1">
                                </div>
                                <div className="col-md-10">
                                    {this.state.mapLoading &&(
                                        <div>
                                            <h4 id="mapLoading" className="text-center">Map is Loading...</h4>
                                            <div className="progress progress-striped active"  style={{width:'80%',"marginLeft":'auto',"marginRight":'auto'}}>
                                                <div className="progress-bar progress-bar-success"  style={{width:'100%'}}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div id="mapContainer">
                                    </div>
                                        {this.state.selectedBusiness !== '' &&(
                                            <div>
                                                <button id="goToBusinessbutton" className="btn btn-warning center-block" onClick={this.redirectToBusiness}>Go to selected business</button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <br className="hidden-lg hidden-md visible-sm visible-xs"/>
                            <div className="row center-block">
                                <div className="alert alert-info text-center">
                                    <div className='row'>
                                        <strong>Click below for more info</strong>
                                    </div>
                                    <div className='row'>
                                        <div className="btn-group">
                                            <button data-toggle="collapse" id="sliderButton" onClick={this.infoClick.bind(this, "sliderButton")} href={"#sliderInfo"}className="btn btn-primary">Slider</button>
                                            <button data-toggle="collapse" id="mapButton" onClick={this.infoClick.bind(this, "mapButton")} href={"#mapInfo"} className="btn btn-primary">Map</button>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-10">
                                                <div id="sliderInfo" className="panel-collapse collapse">
                                                    <br/>
                                                    <strong >Use the slider to adjust the search radius.</strong>
                                                    <br/><br/>
                                                    <strong>The radius is measured in meters.</strong>
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-1"></div>
                                                <div className="col-md-10">
                                                <div id="mapInfo" className="panel-collapse collapse">
                                                    <br/>
                                                    <strong>Click on map to change location</strong>
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                        </div>
                                        <h2><span role="img" aria-label="peacesign">&#x270C;</span></h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {this.state.searchAddress &&(
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-3">
                            </div>
                            <div className="col-md-6" id="searchbox">
                                {this.state.displayAddressError && (
                                    <div className="alert alert-dismissible alert-danger text-center">
                                        <strong>Couldn't find a location similar to your input, Please try again!</strong>
                                    </div>
                                )}
                                <label>Please search a location or click on the map to set one yourself</label>
                                <br/>
                                <Input type="text" className="form-control" id="inputLocation" placeholder="Search address" valueLink={location}/>
                                <small className="text-muted text-danger">{location.error}</small>
                                <br/>
                                <div className="text-center">
                                    <div className="btn-group">
                                        <button className="btn btn-success" onClick={this.search} disabled={location.error}>Search</button>
                                        <button className="btn btn-danger" onClick={this.back}>Back</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                    {this.state.redirectOnLogout && (
                        <Redirect push to={{pathname: "/Login"}}/>
                    )}
                    {this.state.redirectToBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                    )}
                    {this.state.redirectToSpecifiedBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.selectedBusiness}}/>
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

export default SearchArea;