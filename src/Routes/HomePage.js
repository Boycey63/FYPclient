import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import axios from "axios/index";
import { Input,Select } from 'valuelink/tags';
import Link from "valuelink/lib/index";

const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';
let jwt = require('jsonwebtoken');

class HomePage extends Component {
    constructor() {
        super();
        this.state = {
            signedIn: false,
            userDetails: [],
            companyDetails: [],
            categorys: [],
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
            filterValue: '',
            updated: false,
            searchTerm: '',
            redirectSearchTerm: false,
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
                console.log(error);
            });
        }

        //Finds bound coordinates for preset location
        axios({
            method: 'get',
            baseURL: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + localStorage.getItem('location') + '&key=' + apikey,
        }).then(res => {
            if (res.data.results.length > 0) {
                let northeastLat = res.data.results[0].geometry.bounds.northeast.lat;
                let northeastLng = res.data.results[0].geometry.bounds.northeast.lng;
                let southwestLat = res.data.results[0].geometry.bounds.southwest.lat;
                let southwestLng = res.data.results[0].geometry.bounds.southwest.lng;
                //Finds all the business in preset general location
                axios({
                    method: 'post',
                    url: '/select/BusinessLatLng',
                    data: {
                        'A_x': northeastLat,
                        'A_y': northeastLng,
                        'B_x': southwestLat,
                        'B_y': southwestLng,
                        'filterValue': this.state.filterValue,
                    }
                }).then(function (result) {
                    //Loads business data in if any found
                    if (result.data !== "No such business!") {
                        self.setState({
                            filterOption: false,
                            companyDetails: result.data,
                        });
                        let node = document.createElement("p");
                        document.getElementById("header").className = document.getElementById("header").className.replace(/\btext-danger\b/g, "");
                        document.getElementById("header").className = "text-success text-center";
                        node.className = "lead";
                        let textnode = document.createTextNode("All businesses around " + localStorage.getItem('location'));
                        node.appendChild(textnode);
                        document.getElementById("header").appendChild(node);
                    }
                    //Shows error message because no businesses found
                    else {
                        self.setState({
                            filterOption: true,
                            companyDetails: [],
                        });
                        let node = document.createElement("p");
                        node.className = "lead";
                        document.getElementById("header").className = "text-danger text-center";
                        let textnode = document.createTextNode("Couldn't find any businesses around " + localStorage.getItem('location'));
                        node.appendChild(textnode);
                        document.getElementById("header").appendChild(node);
                        document.getElementById("inputLocationMessage").style.visibility = "visible";
                        document.getElementById("inputLocationMessage").innerHTML = "To find businesses in another area please enter the location above";
                    }
                });
            }
            //Shows error message because no businesses found
            else {
                this.setState({
                    location: '',
                    filterOption: true,
                });

                document.getElementById("inputLocationMessage").style.visibility = "visible";
                document.getElementById("inputLocationMessage").innerHTML = "Couldn't find your location please search a location";
            }
        });

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

    //Searches the users input location when no business found
    searchLocation =()=>{
        let header;
        header = document.getElementById("header");

        if (header.hasChildNodes()) {
            header.removeChild(header.childNodes[0]);
        }
        this.setState({
           filterValue: '',
        });
        let self = this;
        //Send user input to the Google API
        axios({
            method:'get',
            baseURL:'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.location + '&key=' + apikey,
        }).then(res => {
            let validAddress = false;
            if(res.data.results.length > 0) {
                let location;
                for (let i = 0; i < res.data.results[0].address_components.length; i++) {
                    if (res.data.results[0].address_components[i].types[0] === "locality") {
                        location = res.data.results[0].address_components[i].long_name;
                        localStorage.removeItem('location');
                        localStorage.setItem("location", location);
                        validAddress = true;
                    }
                    else if (res.data.results[0].address_components[i].types[0] === "administrative_area_level_2") {
                        location = res.data.results[0].address_components[i].long_name;
                        localStorage.removeItem('location');
                        localStorage.setItem("location", location);
                        validAddress = true;
                    }
                    else if (res.data.results[0].address_components[i].types[0] === "administrative_area_level_1") {
                        location = res.data.results[0].address_components[i].long_name;
                        localStorage.removeItem('location');
                        localStorage.setItem("location", location);
                        validAddress = true;
                    }
                }

                //Find businesses in general location if the address is valid
                if(validAddress === true){
                    let northeastLat = res.data.results[0].geometry.bounds.northeast.lat;
                    let northeastLng = res.data.results[0].geometry.bounds.northeast.lng;
                    let southwestLat = res.data.results[0].geometry.bounds.southwest.lat;
                    let southwestLng = res.data.results[0].geometry.bounds.southwest.lng;

                    axios({
                        method: 'post',
                        url: '/select/BusinessLatLng',
                        data: {
                            'A_x': northeastLat,
                            'A_y': northeastLng,
                            'B_x': southwestLat,
                            'B_y': southwestLng,
                            'filterValue': '',
                        }
                    }).then(function (result) {
                        //Sets business data
                        if (result.data !== "No such business!") {
                            document.getElementById("header").className = document.getElementById("header").className.replace(/\btext-danger\b/g, "");
                            document.getElementById("header").className = "text-success text-center";
                            self.setState({
                                filterOption: false,
                                location: '',
                                companyDetails: result.data,
                            });
                            let node = document.createElement("p");
                            node.className = "lead";
                            let textnode = document.createTextNode("All businesses around " + localStorage.getItem('location'));
                            node.appendChild(textnode);
                            document.getElementById("header").appendChild(node);
                        } else {
                            alert("No businesses found");
                        }
                    });
                }else{
                    //Shows error message on page because no business data
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode = document.createTextNode(this.state.location + " is not specific enough, please try again!");
                    document.getElementById("header").className = "text-danger text-center";
                    node.appendChild(textnode);
                    document.getElementById("header").appendChild(node);
                    document.getElementById("inputLocationMessage").style.visibility = "visible";
                    document.getElementById("inputLocationMessage").innerHTML="To find businesses in another area please enter the location above";
                    this.setState({
                        companyDetails: [],
                        location:'',
                        filterOption: true,
                    });
                }
            }else{
                this.setState({
                    location:''
                });
                document.getElementById("inputLocation").placeholder="Location wasn't was found";
            }
        });
    };

    //Redirect tp search term page
    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
           redirectSearchTerm: true,
        });
    };

    //This is for the filter change
    filterChange = () =>{
        let header;
        header = document.getElementById("header");

        if (header.hasChildNodes()) {
            header.removeChild(header.childNodes[0]);
        }
        let self = this;
        let updatedTimer = ()=>{
            self.setState({
                updated: false,
            });
        };

        //Shows the update message
        self.setState({
            updated: true,
        });
        setTimeout(updatedTimer, 1500);

        //Searches for location coordinates
        axios({
            method:'get',
            baseURL:'https://maps.googleapis.com/maps/api/geocode/json?address=',
            url: localStorage.getItem('location') + '&key=' + apikey
        }).then(res => {
            if(res.data.results.length > 0) {
                let location;
                for (let i = 0; i < res.data.results[0].address_components.length; i++) {
                    if(res.data.results[0].address_components[i].types[0] === "locality"){
                        location = res.data.results[0].address_components[i].long_name;
                    }
                    if(res.data.results[0].address_components[i].types[0] === "administrative_area_level_2"){
                        location = res.data.results[0].address_components[i].long_name;
                    }
                }
                let northeastLat = res.data.results[0].geometry.bounds.northeast.lat;
                let northeastLng = res.data.results[0].geometry.bounds.northeast.lng;
                let southwestLat = res.data.results[0].geometry.bounds.southwest.lat;
                let southwestLng = res.data.results[0].geometry.bounds.southwest.lng;
                //Searches for businesses with the given filter in the general location
                axios({
                    method: 'post',
                    url: '/select/BusinessLatLng',
                    data:{
                        'A_x' : northeastLat,
                        'A_y' : northeastLng,
                        'B_x' : southwestLat,
                        'B_y' : southwestLng,
                        'filterValue' : self.state.filterValue,
                    }
                }).then(function (result) {
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode;
                    //Saves businesses details and displays them on page
                    if(result.data !== "No such business!") {
                        self.setState({
                            filterOption: false,
                            location: '',
                            companyDetails: result.data,
                        });
                        document.getElementById("header").className = document.getElementById("header").className.replace(/\balert alert-danger\b/g, "");
                        document.getElementById("header").className = "text-success text-center";
                        if(self.state.filterValue !== '') {
                            textnode = document.createTextNode("Businesses around " + localStorage.getItem('location') + " with the filter of " +self.state.filterValue);
                        }else{
                            textnode = document.createTextNode("All businesses around " + localStorage.getItem('location'));
                        }
                        node.appendChild(textnode);
                        document.getElementById("header").appendChild(node);
                    }
                    //Shows error message when business details not found
                    else{
                        self.setState({
                            companyDetails: [],
                            location:'',
                            filterOption: true,
                        });
                        if(self.state.filterValue !== '') {
                            textnode = document.createTextNode("Couldn't find any businesses around " + localStorage.getItem('location') + " with the filter of " + self.state.filterValue);
                        }else{
                            textnode = document.createTextNode("Couldn't find any businesses around " + localStorage.getItem('location'));
                        }
                        node.appendChild(textnode);
                        document.getElementById("header").className = "text-danger text-center";
                        document.getElementById("header").appendChild(node);
                        document.getElementById("inputLocationMessage").style.visibility = "visible";
                        document.getElementById("inputLocationMessage").innerHTML = "To find businesses in another area please enter the location above";
                    }
                });
            }else{
                this.setState({
                    companyDetails: [],
                    location:'',
                    filterOption: true,
                });
                let node = document.createElement("p");
                node.className = "lead";
                let textnode = document.createTextNode("Couldn't find any businesses around " + localStorage.getItem('location') + " with the filter of " +self.state.filterValue);
                document.getElementById("header").className = "text-danger text-center";
                node.appendChild(textnode);
                document.getElementById("header").appendChild(node);
                document.getElementById("inputLocationMessage").style.visibility = "visible";
                document.getElementById("inputLocationMessage").innerHTML="To find businesses in another area please enter the location above";
            }
        });
    };

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        const location =Link.state(this, 'location').check( x => x );
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
                                <li className="active"><NavLink exact to="/Home">Home</NavLink> <span className="sr-only">(current)</span></li>
                                <li><NavLink exact to="/RecentReviews">Recent Reviews</NavLink></li>
                                <li><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
                                <li><NavLink exact to="/SearchArea">Search Area</NavLink></li>
                            </ul>

                            <form className="navbar-form navbar-left" role="search">
                                <div className="input-group">
                                    <Input type="text" className="form-control" placeholder="Search" valueLink={searchTerm}/>
                                    {searchTerm.error &&(
                                        <span className="input-group-btn"><button disabled={searchTerm.error} className="btn btn-default">Submit</button></span>
                                    )}
                                    {!searchTerm.error &&(
                                        <span className="input-group-btn"><button onClick={this.searchForBusiness} className="btn btn-success">Submit</button></span>
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

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                            <label>Filter by Category</label>
                            <div className="input-group">
                                <Select className="form-control" valueLink={filterValue}>
                                    <option value="" selected>No Filter</option>
                                    {this.state.categorys.map(category =>
                                        <option key = {category.categoryID} value={category.categoryName}>{category.categoryName}</option>
                                    )}
                                </Select>
                                <span className="input-group-btn"><input type="button" className="btn btn-info" onClick={this.filterChange} value="Update"/></span>
                            </div>
                            {this.state.updated && (
                                <div className="row">
                                    <h6 className="text-success text-center"><strong>Updated!</strong></h6>
                                </div>
                            )}
                        </div>
                        <div className="col-md-8"  id="transparentBack">
                            <h3 className="text-center">Home Page</h3>
                            <br/>

                            <div className="text-center" id="header">

                            </div>

                            {this.state.filterOption === true && (
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-8">
                                        <div className="row">
                                            <div className="input-group">
                                                <Input type="text" className="form-control" id="inputLocation" placeholder="Search location" valueLink={location}/>
                                                <span className="input-group-btn"><input type="button" className="btn btn-primary center-block" onClick={this.searchLocation} disabled={location.error} value="Search"/></span>
                                            </div>
                                        </div>
                                        <br/>
                                        <h6 className="text-primary text-center" id="inputLocationMessage"></h6>
                                        <br/>
                                    </div>
                                </div>
                            )}
                            {this.state.companyDetails.map(companyDetail =>
                                <div className="panel-group">
                                    <div className="panel  panel-primary">
                                        <div className="panel-heading">
                                            <div className="panel-title">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="col-sm-6 col-md-6">
                                                            <h4 id="panel-header-text" key ={companyDetail.companyName}>{"Company: " + companyDetail.companyName}</h4>
                                                        </div>
                                                        <div className="col-sm-4 col-md-4"><h3></h3></div>
                                                        <div className="col-sm-2 col-md-2">
                                                            <a  data-toggle="collapse" key ={companyDetail.companyName}  href={"#" + companyDetail.companyName} className="btn btn-default pull-right">Expand</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div key ={companyDetail.businessID}  id={companyDetail.companyName} className="panel-collapse collapse">
                                            <div className="panel-body">
                                                <p className="hidden-lg hidden-md hidden-sm visible-xs">Scroll left to see content</p>
                                                <div className="table-responsive">
                                                    <table className="table table-striped" id="showBorder">
                                                        <tbody>
                                                        <tr>
                                                            <td width="20%">Business Owner</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.ownerName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Business Category</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.categoryName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Year Established</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.formYearEst}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Address</td>
                                                            <td key ={companyDetail.businessID} >{companyDetail.address}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Business Number</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.companyNum}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Business Email</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.companyEmail}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Added to the website</td>
                                                            <td key ={companyDetail.businessID} >{companyDetail.formCreationDate}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Business Description</td>
                                                            <td key ={companyDetail.businessID}>{companyDetail.description}</td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="text-center">
                                                    <NavLink key ={companyDetail.businessID}  exact to={"/SingleBusiness/" + companyDetail.companyName} className="btn btn-warning btn-sm">Go To Page</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {this.state.redirectOnLogout && (
                        <Redirect push to="/Login"/>
                    )}
                    {this.state.redirectToBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                    )}
                    {this.state.redirectSearchTerm && (
                        <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                    )}
                    {this.state.redirectOnInitialPage && (
                        <Redirect push to="/"/>
                    )}
                </div>
            </div>
        );
    }
}

export default HomePage;