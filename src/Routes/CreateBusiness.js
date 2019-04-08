import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Redirect } from 'react-router';
import axios from 'axios';
import "./CSS/ExtraCss.css";
import Link from 'valuelink';
import { Input, Select, TextArea} from 'valuelink/tags';
let jwt = require('jsonwebtoken');


const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';

class Register extends Component {
    constructor() {
        super();
        this.state = {
            companyName: '',
            ownerName: '',
            yearEst: '',
            companyType: '',
            companyNum: '',
            companyEmail: '',
            description: '',
            redirect: false,
            signedIn: false,
            userDetails: [],
            address: '',
            location:'',
            categorys: [],
            latitude:0,
            longitude:0,
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
            searchValue: '',
            redirectToBusiness: false,
            pressed: false,
            currentDate : new Date().toISOString().split('T')[0],
            redirectOnInitialPage: false,
            userLocation:'',
            checkCompanyName: false,
            error :false,
            errorMessage: '',
            businessExists: false,
            businessSuccess: false,
        };
    }

    componentDidMount() {
        if (!localStorage.getItem('location')) {
            this.setState({
                redirectOnInitialPage: true,
            });
        } else {
            this.setState({
                userLocation: localStorage.getItem('location'),
            });
        }

        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        if (retrievedObject === null) {
            self.setState({redirect: true});
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
                            self.setState({redirect: true});
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
                    }

                    axios({
                        method: 'post',
                        url: '/select/userBusiness',
                        data: {
                            userID: self.state.userDetails.user.id,
                        }
                    }).then(function (res) {
                        if (res.data.length === 0) {
                            self.setState({
                                businessExists: false
                            });
                            document.getElementById('form').display = 'block';
                        } else if(res.data.length > 0) {
                            self.setState({
                                businessExists: true,
                            });
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            );
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

    onSubmit = (e) =>{
        e.preventDefault();
        let self = this;
        if(self.state.yearEst < document.getElementById("date").max) {
            let companyName = this.state.companyName;

            let businessSuccess = () => {
                self.setState({redirectToBusiness: true});
            };

            axios({
                method: 'post',
                url: '/select/checkCompanyName',
                data: {
                    companyName: companyName,
                    companyID: '',
                }
            }).then(function (res) {
                if (res.data === "exists") {
                    self.setState({
                        errorMessage: 'Company Name already exists...Please update your input and submit again',
                        error: true,
                    });
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                } else {
                    axios({
                        method: 'post',
                        url: '/insert/BusinessTable',
                        data: {
                            companyName: self.state.companyName.replace(/'/g, ''),
                            ownerName: self.state.ownerName.replace(/'/g, ''),
                            yearEst: self.state.yearEst,
                            companyNum: self.state.companyNum,
                            companyEmail: self.state.companyEmail,
                            description: self.state.description.replace(/'/g, ''),
                            isOpen: 0,
                            address: self.state.address.replace(/'/g, ''),
                            latitude: self.state.latitude,
                            longitude: self.state.longitude,
                            monday: self.state.mondayO + "-" + self.state.mondayC,
                            tuesday: self.state.tuesdayO + "-" + self.state.tuesdayC,
                            wednesday: self.state.wednesdayO + "-" + self.state.wednesdayC,
                            thursday: self.state.thursdayO + "-" + self.state.thursdayC,
                            friday: self.state.fridayO + "-" + self.state.fridayC,
                            saturday: self.state.saturdayO + "-" + self.state.saturdayC,
                            sunday: self.state.sundayO + "-" + self.state.sundayC,
                            categoryID: self.state.category,
                            userID: self.state.userDetails.user.id,
                        }
                    }).then(function (res) {
                        if (res.data === "success") {
                            self.setState({
                                searchValue: self.state.companyName,
                                businessSuccess: true,
                            });
                            self.setState({businessSuccess: true,});
                            setTimeout(businessSuccess, 2000);
                        }
                    }).then(function () {
                        self.setState({
                            companyName: "",
                            ownerName: "",
                            yearEst: "",
                            category: "",
                            companyNum: "",
                            companyEmail: "",
                            description: "",
                            address: "",
                            location: "",
                            latitude: 0,
                            longitude: "",
                            monday: "",
                            tuesday: "",
                            wednesday: "",
                            thursday: "",
                            friday: "",
                            saturday: "",
                            sunday: "",
                        });
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            });
        }else{
            document.getElementById("yearEstError").innerHTML = "Date must be before todays date";
            document.getElementById('forDateError').scrollIntoView();
        }
    };

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirect: true,
        });
    };

    render() {
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
            <div className="overallPage">
                <div className="container">
                    <div className="col-xs-12 col-sm-12 col-md-12">
                        <form className="form-horizontal" id="transparentBack">
                            <br/>

                            <fieldset>
                                <legend className="text-center">Create a Business</legend>
                                {this.state.businessExists &&(
                                    <div className="row text-center">
                                        <h4>You already made a business!</h4>
                                        <br/>
                                        <div className="btn-group">
                                            <NavLink className="btn btn-success" exact to="/MyBusiness">My Business</NavLink>
                                            <NavLink className="btn btn-danger" exact to="/Home">Go Back</NavLink>
                                        </div>
                                    </div>
                                )}
                                {this.state.businessSuccess && (
                                    <div>
                                        <div className="col-md-2"></div>
                                        <div className="col-md-8">
                                            <div className="alert alert-success text-center">
                                                <strong>Business was created!</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!this.state.businessSuccess && (
                                    <div>
                                    {!this.state.businessExists && (
                                        <div>
                                            <div className="row">
                                                {this.state.error &&(
                                                    <div className="alert alert-dismissible alert-danger text-center">
                                                        <strong>{this.state.errorMessage}</strong>
                                                    </div>
                                                )}

                                                <h4 className="lead text-center">Owner Info</h4>
                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputUsername" className="control-label">Owner name</label>
                                                        <Input className="form-control" id="username" valueLink={ownerName} type="text" placeholder="Owner name"/>
                                                        <small className="text-danger">{ownerName.error}</small>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputCompanyNum" className="control-label">Owner's Number</label>
                                                        <Input className="form-control" id="companyNum" valueLink={companyNum} type="text" placeholder="Owner's phone number"/>
                                                        <small className="text-danger">{companyNum.error}</small>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputCompanyEmail" className="control-label">Owner's Email</label>
                                                        <Input className="form-control" id="companyEmail" valueLink={companyEmail} type="text" placeholder="Owner's Email"/>
                                                        <small className="text-danger">{companyEmail.error}</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <h4 className="lead text-center">Company Info</h4>
                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputCompName" className="control-label">Company Name</label>
                                                        <Input className="form-control" id="companyName" valueLink={companyName} type="text" placeholder="Company Name"/>
                                                        <small className="text-danger" id="invalidInput">{companyName.error}</small>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8" id="forDateError">
                                                        <label htmlFor="inputDateEst" className="control-label">Year Established</label>
                                                        <Input className="form-control" id="date" type="date" max={this.state.currentDate}  valueLink={yearEst}/>
                                                        <small className="text-danger" id="yearEstError">{yearEst.error}</small>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
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

                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputAddress" className="control-label">Company Address</label>
                                                        <div className="input-group">
                                                            <Input className="form-control" id="location" valueLink={location} type="text" placeholder="Address"/>
                                                            <span className="input-group-btn"><input className="btn btn-info" type="button" disabled={this.state.location === ''} onClick={this.search} value="Search" /></span>
                                                        </div>
                                                        <small className="text-danger">{location.error}</small>
                                                    </div>
                                                </div>


                                                <div className="form-group">
                                                    <div className="col-md-2"></div>
                                                    <div className="col-md-8">
                                                        <label htmlFor="inputDescription" className="control-label">Company Description</label>
                                                        <TextArea className="form-control" id="textArea" valueLink={description} rows="4" placeholder="Description"/>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <h4 className="lead text-center">Open/Closing Times</h4>
                                                <div className="form-group">
                                                    <span className="help-block text-center"><u>Optional Fields</u></span>
                                                    <label htmlFor="Monday" className="col-md-2 control-label">Monday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputMondayO" valueLink={mondayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{mondayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputMondayC" valueLink={mondayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{mondayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="Tuesday" className="col-md-2 control-label">Tuesday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputTuesdayO" valueLink={tuesdayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{tuesdayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputTuesdayC" valueLink={tuesdayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{tuesdayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="Wednesday" className="col-md-2 control-label">Wednesday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputWednesdayO" valueLink={wednesdayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{wednesdayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputWednesdayC" valueLink={wednesdayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{wednesdayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="Thursday" className="col-md-2 control-label">Thursday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputThursdayO" valueLink={thursdayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{thursdayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputThursdayC" valueLink={thursdayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{thursdayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="inputOwnerName" className="col-md-2 control-label">Friday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputFridayO" valueLink={fridayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputFridayC" valueLink={fridayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="inputOwnerName" className="col-md-2 control-label">Saturday</label>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputSaturdayO" valueLink={saturdayO} type="time" step="600" placeholder="Opening Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayO.error}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <Input className="form-control" id="inputSaturdayC" valueLink={saturdayC} type="time" step="600" placeholder="Closing Time"/>
                                                        <small id="ownernameHelp" className="form-text text-muted">{fridayC.error}</small>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="inputOwnerName" className="col-md-2 control-label">Sunday</label>
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
                                                    <button type="submit" onClick={this.onSubmit} className="btn btn-primary center-block" disabled={ownerName.error || companyName.error || yearEst.error || category.error || companyNum.error || companyEmail.error || this.state.pressed === false}>Submit</button>
                                                    <NavLink className="btn btn-danger" exact to="/Home">Go Back</NavLink>
                                                </div>
                                            </div>
                                            <br/>
                                        </div>
                                        )}
                                    </div>
                                    )}
                            </fieldset>
                        </form>
                    </div>
                </div>
                <div className="clearfix visible-xs"></div>
                {this.state.redirectToBusiness && (
                    <Redirect push to={{pathname: "MyBusiness"}}/>
                )}
                {this.state.redirect && (
                    <Redirect push to="/Login"/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to={{pathname: "/"}}/>
                )}
            </div>
        );
    }
}

export default Register;