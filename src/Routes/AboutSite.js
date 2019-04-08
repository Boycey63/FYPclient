import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import axios from "axios/index";
import { Input, Select} from 'valuelink/tags';
import Link from "valuelink/lib/index";

const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';

class AboutSite extends Component {

    constructor() {
        super();
        this.state = {
            intialChoice: '',
            country: '',
            address: '',
            locationSearched: false,
            latlng: '',
            redirectHome: false,
            futureTokenVal: '',
            errorValue: '',
            redirectError: false,
        };
    }

    componentDidMount() {
        if (localStorage.getItem('location')) {
            localStorage.clear();
        }

        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        //Checks if the user is logged in already
        axios({
            method: 'get',
            url: '/select/testConnection',
        }).then(function (res) {
            if (res.data !== 200) {
                self.setState({
                    errorValue: res.data,
                    redirectError: true,
                });
            }else{
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
                        //If signed in already, redirect to home
                        if (res.data === "pass") {
                            self.setState({
                                redirectHome: true,
                            });
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    onSubmit = (e) =>{
        e.preventDefault();
    };

    //Find the general location from the user input on the selection page
    addressSearched = () => {
        axios({
            method: 'get',
            baseURL: 'https://maps.googleapis.com/maps/api/geocode/json?address=',
            url: this.state.address + '&key=' + apikey
        }).then(res => {
            let address = [];
            if(res.data.results.length > 0) {
                let address = '';
                let validAddress = false;
                for (let i = 0; i < res.data.results[0].address_components.length; i++) {
                    if(address === '') {
                        //Find the general name for the users location
                        if(res.data.results[0].address_components[i].types[0] === "locality"){
                            address = res.data.results[0].address_components[i].long_name;
                            validAddress = true;
                        }
                        else if (res.data.results[0].address_components[i].types[0] === "administrative_area_level_2") {
                            address = res.data.results[0].address_components[i].long_name;
                            validAddress = true;
                        }
                        else if (res.data.results[0].address_components[i].types[0] === "administrative_area_level_1" && address === '') {
                            address = res.data.results[0].address_components[i].long_name;
                            validAddress = true;
                        }
                    }
                }
                if(validAddress === true) {
                    this.setState({
                        locationSearched: true,
                        address: res.data.results[0].formatted_address,
                        futureTokenVal: address,
                        latlng: res.data.results[0].geometry.location.lat + ", " + res.data.results[0].geometry.location.lng,
                    });
                }else{
                    this.setState({
                        address: "",
                    });
                    document.getElementById("addressChoice").placeholder  = "Location needs to be more specific, Try again";
                }
            }else{
                this.setState({
                    address: "",
                });
                document.getElementById("addressChoice").placeholder  = "Location didn't exist, Try again";
            }
        });
    };

    onButtonClick = () =>{
        document.getElementById("content1").style.display = "none";
        document.getElementById("content2").style.display = "block";
    };

    goBack = () =>{
        this.setState({
            intialChoice: ''
        });
        document.getElementById("content2").style.display = "none";
        document.getElementById("content1").style.display = "block";
    };

    //If the user has entered a location and clicks to continue
    onContinueClick = (e) =>{
        e.preventDefault();
        //Checks what option they chose
        if(this.state.intialChoice === "1"){
            //Sets GPS configurations
            let options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            //If you successfully get the GPS location
            let success = (pos) => {
                let currentlocation;
                axios({
                    method: 'get',
                    baseURL: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + pos.coords.latitude + "," + pos.coords.longitude + '&key=' + apikey
                }).then(res => {
                    if(res.data.results.length > 0) {
                        for (let i = 0; i < res.data.results[0].address_components.length; i++) {
                            if(res.data.results[0].address_components[i].types[0] === "locality"){
                                currentlocation = res.data.results[0].address_components[i].long_name;
                            }
                            else if(res.data.results[0].address_components[i].types[0] === "administrative_area_level_2"){
                                currentlocation = res.data.results[0].address_components[i].long_name;
                            }
                            else if(res.data.results[0].address_components[i].types[0] === "administrative_area_level_1"){
                                currentlocation = res.data.results[0].address_components[i].long_name;
                            }
                        }
                        localStorage.setItem("location", currentlocation);
                        this.setState({
                            redirectHome: true,
                        });
                    }else{
                        this.setState({
                            address: "",
                        });
                        document.getElementById("invalidInputLocation").placeholder  = "Location didn't exist, Try again";
                    }
                });
            };
            //IF you don't get the location GPS successfully
            let error1 = (err) =>{
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        document.getElementById("invalidInputLocation").innerHTML ="You denied the request for Geolocation, Please select another location option or change your Geolocation settings and try again";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        document.getElementById("invalidInputLocation").innerHTML ="Location information is unavailable, Please try another location option.";
                        break;
                    case err.TIMEOUT:
                        document.getElementById("invalidInputLocation").innerHTML ="Location information is unavailable, Please try another location option.";
                        break;
                    case err.UNKNOWN_ERROR:
                        document.getElementById("invalidInputLocation").innerHTML ="There was an error trying to get your location, Please try another location option.";
                        break;
                }
            };

            navigator.geolocation.getCurrentPosition(success, error1, options);
        }
        //If the user entered their own location
        if(this.state.intialChoice === "2"){
            //save location
            localStorage.setItem("location", this.state.futureTokenVal);
            this.setState({
                redirectHome :true,
            });
        }
        //if the user chose to pick a country
        if(this.state.intialChoice === "3"){
            //save location
            localStorage.setItem("location", this.state.country);
            this.setState({
                redirectHome :true,
            });
        }
    };

    render(){
        const intialChoice = Link.state(this, 'intialChoice')
            .check( x => x ,'Required field');

        const addressChoice = Link.state(this, 'address')
            .check( x => x ,'Required field');

        const countryChoice = Link.state(this, 'country')
            .check( x => x ,'Required field');

        return (
            <div className="overallPage">
                <div id="aboutPageContainer" className="container-fluid">
                    <div className="col-md-2"></div>
                    <div id="aboutDiv" className="col-md-8 row">
                        <div id="addPadding" className="row">
                            <div>
                                <NavLink className="pull-right" exact to="/Login">Already have an account?</NavLink>
                            </div>
                            <br/>
                            <h2 className="text-center">The Little Guys Project</h2>
                            <div id="content1">
                                <h4 className="text-center">What is this website?</h4>
                                <br/>
                                <p className="text-center">This sites aim is to help smaller businesses by letting them advertise themselves and help them grow.</p>
                                <br/>
                                <div className="row">
                                    <div className="col-md-6 text-center">
                                        <p>What can you do with the LittleGuys website as a business owner?</p>
                                        <ul id="aboutList" style={{marginRight: 50 + 'px'}}>
                                            <li>Create your business profile</li>
                                            <li>Set up your open hours and location</li>
                                            <li>Get in contact with possible customers</li>
                                            <li>Retrieve user reviews</li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6 text-center">
                                        <p>What can you do with the LittleGuys website as a general customer?</p>
                                        <ul id="aboutList" style={{marginRight: 25 + 'px'}} >
                                            <li>Create your user profile</li>
                                            <li>Search your general location for businesses</li>
                                            <li>Get in contact with business owners</li>
                                            <li>Add reviews to the businesses you have used</li>
                                        </ul>
                                    </div>
                                </div>
                                <input type="button" className="btn btn-primary center-block" onClick={this.onButtonClick} value="Get Started!"/>
                            </div>
                            <div id="content2">
                                <p className="text-center lead">Select a method of getting location</p>
                                <form className="form-horizontal" onSubmit={this.onSubmit}>
                                    <fieldset>
                                        <div className="row">
                                            <div className="col-lg-2"></div>
                                            <div className="col-lg-8">
                                                {this.state.intialChoice === "1" && (
                                                    <small className="form-text text-muted text-info">The accuracy of your GPS will depend on your device</small>
                                                )}
                                                <Select className="form-control" valueLink={intialChoice}>
                                                    <option value="" selected hidden>Select Method</option>
                                                    <option value="1">Use GPS</option>
                                                    <option value="2">Search Address</option>
                                                    <option value="3">Select a Country</option>
                                                </Select>
                                                <small className="form-text text-muted text-danger">{intialChoice.error}</small>
                                            </div>
                                        </div>
                                        {this.state.intialChoice === "1" && (
                                            <div className="row">
                                                <div className="col-lg-2"></div>
                                                <div className="col-lg-8">
                                                    <small className="form-text text-muted" id="invalidInputLocation"></small>
                                                    <br/>
                                                    <input type="submit"  className="btn btn-primary center-block" onClick={this.onContinueClick}  value="Continue"/>
                                                </div>
                                            </div>
                                        )}
                                        {this.state.intialChoice === "2" && (
                                            <div className="row">
                                                <div className="col-lg-2"></div>
                                                <div className="col-lg-8">
                                                    <br/>
                                                    <h4>Please input an address and search</h4>
                                                    <small className="form-text text-muted text-info">This will use the general location of the address</small>
                                                    <div className="input-group">
                                                        <Input className="form-control" id="addressChoice" placeholder="Address here" valueLink={addressChoice}/>
                                                        <span className="input-group-btn"><input type="button" className="btn btn-warning" disabled={addressChoice.error} onClick={this.addressSearched} value="Search"/></span>
                                                    </div>
                                                    <small className="form-text text-muted text-danger">{addressChoice.error}</small>
                                                    {this.state.locationSearched === true && this.state.address !== '' &&(
                                                        <small className="form-text text-muted text-danger">Update the above address if it's not right</small>
                                                    )}
                                                    {this.state.locationSearched === true &&(
                                                        <div>
                                                            <br/>
                                                            <input type="submit"  className="btn btn-primary center-block" disabled={addressChoice.error} onClick={this.onContinueClick} value="Continue"/>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {this.state.intialChoice === "3" && (
                                            <div className="row">
                                                <div className="col-lg-2"></div>
                                                <div className="col-lg-8">
                                                    <br/>
                                                    <h4>Please select a country</h4>
                                                    <Select size={10} className="form-control" valueLink={countryChoice}>
                                                        <option value="" selected hidden>Select Method</option>
                                                            <option value="Kabul" title="Afghanistan">Afghanistan</option>
                                                            <option value="Mariehamn" title="Åland Islands">Åland Islands</option>
                                                            <option value="Tirana" title="Albania">Albania</option>
                                                            <option value="Algiers" title="Algeria">Algeria</option>
                                                            <option value="Pago Pago" title="American Samoa">American Samoa</option>
                                                            <option value="Andorra la Vella" title="Andorra">Andorra</option>
                                                            <option value="Luanda" title="Angola">Angola</option>
                                                            <option value="The Valley, Anguilla" title="Anguilla">Anguilla</option>
                                                            <option value="Saint John's" title="Antigua and Barbuda">Antigua and Barbuda</option>
                                                            <option value="Buenos Aires" title="Argentina">Argentina</option>
                                                            <option value="Yerevan" title="Armenia">Armenia</option>
                                                            <option value="Oranjestad" title="Aruba">Aruba</option>
                                                            <option value="Canberra" title="Australia">Australia</option>
                                                            <option value="Vienna" title="Austria">Austria</option>
                                                            <option value="Baku" title="Azerbaijan">Azerbaijan</option>
                                                            <option value="Nassau" title="Bahamas">Bahamas</option>
                                                            <option value="Manama" title="Bahrain">Bahrain</option>
                                                            <option value="Dhaka" title="Bangladesh">Bangladesh</option>
                                                            <option value="Bridgetown" title="Barbados">Barbados</option>
                                                            <option value="Minsk" title="Belarus">Belarus</option>
                                                            <option value="Brussels" title="Belgium">Belgium</option>
                                                            <option value="Belmopan" title="Belize">Belize</option>
                                                            <option value="Porto-Novo" title="Benin">Benin</option>
                                                            <option value="Hamilton, Bermuda" title="Bermuda">Bermuda</option>
                                                            <option value="Thimphu" title="Bhutan">Bhutan</option>
                                                            <option value="La Paz" title="Bolivia, Plurinational State of">Bolivia, Plurinational State of</option>
                                                            <option value="Kralendijk" title="Bonaire, Sint Eustatius and Saba">Bonaire, Sint Eustatius and Saba</option>
                                                            <option value="Sarajevo" title="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                                            <option value="Gaborone" title="Botswana">Botswana</option>
                                                            <option value="Brasilia" title="Brazil">Brazil</option>
                                                            <option value="Bandar Seri Begawan" title="Brunei Darussalam">Brunei Darussalam</option>
                                                            <option value="Sofia" title="Bulgaria">Bulgaria</option>
                                                            <option value="Ouagadougou" title="Burkina Faso">Burkina Faso</option>
                                                            <option value="Bujumbura" title="Burundi">Burundi</option>
                                                            <option value="Phnom Penh" title="Cambodia">Cambodia</option>
                                                            <option value="Yaounde" title="Cameroon">Cameroon</option>
                                                            <option value="Ottawa" title="Canada">Canada</option>
                                                            <option value="Praia" title="Cape Verde">Cape Verde</option>
                                                            <option value="George Town,Cayman Islands" title="Cayman Islands">Cayman Islands</option>
                                                            <option value="Bangui" title="Central African Republic">Central African Republic</option>
                                                            <option value="N'Djamena" title="Chad">Chad</option>
                                                            <option value="Santiago" title="Chile">Chile</option>
                                                            <option value="Beijing" title="China">China</option>
                                                            <option value="Flying Fish Cove‎" title="Christmas Island">Christmas Island</option>
                                                            <option value="West Island, Cocos (Keeling) Islands" title="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option>
                                                            <option value="Bogota" title="Colombia">Colombia</option>
                                                            <option value="Moroni" title="Comoros">Comoros</option>
                                                            <option value="Brazzaville" title="Congo">Congo</option>
                                                            <option value="Kinshasa, the Democratic Republic of the" title="Congo, the Democratic Republic of the">Congo, the Democratic Republic of the</option>
                                                            <option value="Avarua" title="Cook Islands">Cook Islands</option>
                                                            <option value="San Jose" title="Costa Rica">Costa Rica</option>
                                                            <option value="Yamoussoukro " title="Côte d'Ivoire">Côte d'Ivoire</option>
                                                            <option value="Zagreb" title="Croatia">Croatia</option>
                                                            <option value="Havana" title="Cuba">Cuba</option>
                                                            <option value="Willemstad" title="Curaçao">Curaçao</option>
                                                            <option value="Nicosia" title="Cyprus">Cyprus</option>
                                                            <option value="Prague" title="Czech Republic">Czech Republic</option>
                                                            <option value="Copenhagen" title="Denmark">Denmark</option>
                                                            <option value="Djibouti" title="Djibouti">Djibouti</option>
                                                            <option value="Roseau" title="Dominica">Dominica</option>
                                                            <option value="Santo Domingo" title="Dominican Republic">Dominican Republic</option>
                                                            <option value="Dili" title="East Timor">East Timor</option>
                                                            <option value="Quito" title="Ecuador">Ecuador</option>
                                                            <option value="Cairo" title="Egypt">Egypt</option>
                                                            <option value="San Salvador" title="El Salvador">El Salvador</option>
                                                            <option value="Malabo" title="Equatorial Guinea">Equatorial Guinea</option>
                                                            <option value="Asmara" title="Eritrea">Eritrea</option>
                                                            <option value="Tallinn" title="Estonia">Estonia</option>
                                                            <option value="Addis Ababa" title="Ethiopia">Ethiopia</option>
                                                            <option value="Stanley, Falkland Islands (Malvinas)" title="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option>
                                                            <option value="Tórshavn" title="Faroe Islands">Faroe Islands</option>
                                                            <option value="Suva" title="Fiji">Fiji</option>
                                                            <option value="Helsinki" title="Finland">Finland</option>
                                                            <option value="Paris" title="France">France</option>
                                                            <option value="Cayenne" title="French Guiana">French Guiana</option>
                                                            <option value="Papeete" title="French Polynesia">French Polynesia</option>
                                                            <option value="Saint-Pierre, Réunion" title="French Southern Territories">French Southern Territories</option>
                                                            <option value="Libreville" title="Gabon">Gabon</option>
                                                            <option value="Banjul" title="Gambia">Gambia</option>
                                                            <option value="Tbilisi" title="Georgia">Georgia</option>
                                                            <option value="Berlin" title="Germany">Germany</option>
                                                            <option value="Accra" title="Ghana">Ghana</option>
                                                            <option value="Gibraltar" title="Gibraltar">Gibraltar</option>
                                                            <option value="Athens" title="Greece">Greece</option>
                                                            <option value="Nuuk" title="Greenland">Greenland</option>
                                                            <option value="Saint George's" title="Grenada">Grenada</option>
                                                            <option value="Basse-Terre" title="Guadeloupe">Guadeloupe</option>
                                                            <option value="Hagåtña" title="Guam">Guam</option>
                                                            <option value="Guatemala City" title="Guatemala">Guatemala</option>
                                                            <option value="Saint Peter Port, Guernsey" title="Guernsey">Guernsey</option>
                                                            <option value="Conakry" title="Guinea">Guinea</option>
                                                            <option value="Bissau" title="Guinea-Bissau">Guinea-Bissau</option>
                                                            <option value="Georgetown" title="Guyana">Guyana</option>
                                                            <option value="Port-au-Prince" title="Haiti">Haiti</option>
                                                            <option value="Heard Island and McDonald Islands" title="Heard Island and McDonald Islands">Heard Island and McDonald Islands</option>
                                                            <option value="Tegucigalpa" title="Honduras">Honduras</option>
                                                            <option value="Hong Kong" title="Hong Kong">Hong Kong</option>
                                                            <option value="Budapest" title="Hungary">Hungary</option>
                                                            <option value="Reykjavik" title="Iceland">Iceland</option>
                                                            <option value="New Delhi" title="India">India</option>
                                                            <option value="Jakarta" title="Indonesia">Indonesia</option>
                                                            <option value="Tehran" title="Iran, Islamic Republic of">Iran, Islamic Republic of</option>
                                                            <option value="Baghdad" title="Iraq">Iraq</option>
                                                            <option value="Dublin" title="Ireland">Ireland</option>
                                                            <option value="Douglas, Isle of Man" title="Isle of Man">Isle of Man</option>
                                                            <option value="Jerusalem" title="Israel">Israel</option>
                                                            <option value="Rome" title="Italy">Italy</option>
                                                            <option value="Kingston" title="Jamaica">Jamaica</option>
                                                            <option value="Tokyo" title="Japan">Japan</option>
                                                            <option value="Saint Helier" title="Jersey">Jersey</option>
                                                            <option value="Amman" title="Jordan">Jordan</option>
                                                            <option value="Astana" title="Kazakhstan">Kazakhstan</option>
                                                            <option value="Nairobi" title="Kenya">Kenya</option>
                                                            <option value="Tarawa Atoll" title="Kiribati">Kiribati</option>
                                                            <option value="Pyongyang" title="Korea, Democratic People's Republic of">Korea, Democratic People's Republic of</option>
                                                            <option value="Seoul" title="Korea, Republic of">Korea, Republic of</option>
                                                            <option value="Pristina" title="Kosovo ">Kosovo </option>
                                                            <option value="Kuwait City" title="Kuwait">Kuwait</option>
                                                            <option value="Bishkek" title="Kyrgyzstan">Kyrgyzstan</option>
                                                            <option value="Vientiane" title="Lao People's Democratic Republic">Lao People's Democratic Republic</option>
                                                            <option value="Vientiane" title="Laos ">Laos </option>
                                                            <option value="Riga" title="Latvia">Latvia</option>
                                                            <option value="Beirut" title="Lebanon">Lebanon</option>
                                                            <option value="Maseru" title="Lesotho">Lesotho</option>
                                                            <option value="Monrovia" title="Liberia">Liberia</option>
                                                            <option value="Tripoli" title="Libya">Libya</option>
                                                            <option value="Vaduz" title="Liechtenstein">Liechtenstein</option>
                                                            <option value="Vilnius" title="Lithuania">Lithuania</option>
                                                            <option value="Luxembourg" title="Luxembourg">Luxembourg</option>
                                                            <option value="Macau" title="Macau ">Macau </option>
                                                            <option value="Skopje" title="Macedonia, the former Yugoslav Republic of">Macedonia, the former Yugoslav Republic of</option>
                                                            <option value="Antananarivo" title="Madagascar">Madagascar</option>
                                                            <option value="Lilongwe" title="Malawi">Malawi</option>
                                                            <option value="Kuala Lumpur" title="Malaysia">Malaysia</option>
                                                            <option value="Male" title="Maldives">Maldives</option>
                                                            <option value="Bamako" title="Mali">Mali</option>
                                                            <option value="Valletta" title="Malta">Malta</option>
                                                            <option value="Majuro" title="Marshall Islands">Marshall Islands</option>
                                                            <option value="Fort-de-France" title="Martinique">Martinique</option>
                                                            <option value="Nouakchott" title="Mauritania">Mauritania</option>
                                                            <option value="Port Louis" title="Mauritius">Mauritius</option>
                                                            <option value="Mamoudzou" title="Mayotte">Mayotte</option>
                                                            <option value="Mexico City" title="Mexico">Mexico</option>
                                                            <option value="Palikir" title="Micronesia, Federated States of">Micronesia, Federated States of</option>
                                                            <option value="Chisinau" title="Moldova, Republic of">Moldova, Republic of</option>
                                                            <option value="Monaco" title="Monaco">Monaco</option>
                                                            <option value="Ulaanbaatar" title="Mongolia">Mongolia</option>
                                                            <option value="Podgorica" title="Montenegro">Montenegro</option>
                                                            <option value="Plymouth" title="Montserrat">Montserrat</option>
                                                            <option value="Rabat" title="Morocco">Morocco</option>
                                                            <option value="Maputo" title="Mozambique">Mozambique</option>
                                                            <option value="Rangoon " title="Myanmar">Myanmar</option>
                                                            <option value="Windhoek" title="Namibia">Namibia</option>
                                                            <option value="Yaren District" title="Nauru">Nauru</option>
                                                            <option value="Kathmandu" title="Nepal">Nepal</option>
                                                            <option value="Amsterdam" title="Netherlands">Netherlands</option>
                                                            <option value="Nouméa" title="New Caledonia">New Caledonia</option>
                                                            <option value="Wellington" title="New Zealand">New Zealand</option>
                                                            <option value="Managua" title="Nicaragua">Nicaragua</option>
                                                            <option value="Niamey" title="Niger">Niger</option>
                                                            <option value="Abuja" title="Nigeria">Nigeria</option>
                                                            <option value="Alofi" title="Niue">Niue</option>
                                                            <option value="Kingston, Norfolk Island" title="Norfolk Island">Norfolk Island</option>
                                                            <option value="Capitol Hill, Saipan" title="Northern Mariana Islands">Northern Mariana Islands</option>
                                                            <option value="Oslo" title="Norway">Norway</option>
                                                            <option value="Muscat" title="Oman">Oman</option>
                                                            <option value="Islamabad" title="Pakistan">Pakistan</option>
                                                            <option value="Melekeok" title="Palau">Palau</option>
                                                            <option value="Jerusalem, Ramallah, Gaza City" title="Palestinian Territory, Occupied">Palestinian Territory, Occupied</option>
                                                            <option value="Panama City" title="Panama">Panama</option>
                                                            <option value="Port Moresby" title="Papua New Guinea">Papua New Guinea</option>
                                                            <option value="Asuncion" title="Paraguay">Paraguay</option>
                                                            <option value="Lima" title="Peru">Peru</option>
                                                            <option value="Manila" title="Philippines">Philippines</option>
                                                            <option value="Adamstown" title="Pitcairn">Pitcairn</option>
                                                            <option value="Warsaw" title="Poland">Poland</option>
                                                            <option value="Lisbon" title="Portugal">Portugal</option>
                                                            <option value="San Juan" title="Puerto Rico">Puerto Rico</option>
                                                            <option value="Doha" title="Qatar">Qatar</option>
                                                            <option value="Saint-Denis" title="Réunion">Réunion</option>
                                                            <option value="Bucharest" title="Romania">Romania</option>
                                                            <option value="Moscow" title="Russian Federation">Russian</option>
                                                            <option value="Kigali" title="Rwanda">Rwanda</option>
                                                            <option value="Gustavia, Saint Barthélemy" title="Saint Barthélemy">Saint Barthélemy</option>
                                                            <option value="Jamestown" title="Saint Helena, Ascension and Tristan da Cunha">Saint Helena, Ascension and Tristan da Cunha</option>
                                                            <option value="Basseterre" title="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                                            <option value="Castries" title="Saint Lucia">Saint Lucia</option>
                                                            <option value="Marigot" title="Saint Martin (French part)">Saint Martin (French part)</option>
                                                            <option value="Saint Pierre and Miquelon" title="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option>
                                                            <option value="Kingstown, Saint Vincent and the Grenadines" title="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                                            <option value="Apia" title="Samoa">Samoa</option>
                                                            <option value="San Marino" title="San Marino">San Marino</option>
                                                            <option value="Sao Tome" title="Sao Tome and Principe">Sao Tome and Principe</option>
                                                            <option value="Riyadh" title="Saudi Arabia">Saudi Arabia</option>
                                                            <option value="Dakar" title="Senegal">Senegal</option>
                                                            <option value="Belgrade" title="Serbia">Serbia</option>
                                                            <option value="Victoria" title="Seychelles">Seychelles</option>
                                                            <option value="Freetown" title="Sierra Leone">Sierra Leone</option>
                                                            <option value="Singapore" title="Singapore">Singapore</option>
                                                            <option value="Philipsburg (Dutch part)" title="Sint Maarten (Dutch part)">Sint Maarten (Dutch part)</option>
                                                            <option value="Bratislava" title="Slovakia">Slovakia</option>
                                                            <option value="Ljubljana" title="Slovenia">Slovenia</option>
                                                            <option value="Honiara" title="Solomon Islands">Solomon Islands</option>
                                                            <option value="Mogadishu" title="Somalia">Somalia</option>
                                                            <option value="Cape Town" title="South Africa">South Africa</option>
                                                            <option value="King Edward Point" title="South Georgia and the South Sandwich Islands">South Georgia and the South Sandwich Islands</option>
                                                            <option value="Juba " title="South Sudan">South Sudan</option>
                                                            <option value="Madrid" title="Spain">Spain</option>
                                                            <option value="Colombo" title="Sri Lanka">Sri Lanka</option>
                                                            <option value="Khartoum" title="Sudan">Sudan</option>
                                                            <option value="Paramaribo" title="Suriname">Suriname</option>
                                                            <option value="Longyearbyen" title="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option>
                                                            <option value="Mbabane" title="Swaziland">Swaziland</option>
                                                            <option value="Stockholm" title="Sweden">Sweden</option>
                                                            <option value="Bern" title="Switzerland">Switzerland</option>
                                                            <option value="Damascus" title="Syria">Syria</option>
                                                            <option value="Taipei" title="Taiwan">Taiwan</option>
                                                            <option value="Dushanbe" title="Tajikistan">Tajikistan</option>
                                                            <option value="Dar es Salaam" title="Tanzania, United Republic of">Tanzania, United Republic of</option>
                                                            <option value="Bangkok" title="Thailand">Thailand</option>
                                                            <option value="Dili" title="Timor-Leste">Timor-Leste</option>
                                                            <option value="Lome" title="Togo">Togo</option>
                                                            <option value="Atafu" title="Tokelau">Tokelau</option>
                                                            <option value="Nuku'alofa" title="Tonga">Tonga</option>
                                                            <option value="Port-of-Spain, Trinidad and Tobago" title="Trinidad and Tobago">Trinidad and Tobago</option>
                                                            <option value="Tunis" title="Tunisia">Tunisia</option>
                                                            <option value="Ankara" title="Turkey">Turkey</option>
                                                            <option value="Ashgabat" title="Turkmenistan">Turkmenistan</option>
                                                            <option value="Cockburn Town" title="Turks and Caicos Islands">Turks and Caicos Islands</option>
                                                            <option value="Vaiaku village" title="Tuvalu">Tuvalu</option>
                                                            <option value="Kampala" title="Uganda">Uganda</option>
                                                            <option value="Kyiv" title="Ukraine">Ukraine</option>
                                                            <option value="Abu Dhabi" title="United Arab Emirates">United Arab Emirates</option>
                                                            <option value="London" title="United Kingdom">United Kingdom</option>
                                                            <option value="Washington D.C." title="United States of America">United States of America</option>
                                                            <option value="Montevideo" title="Uruguay">Uruguay</option>
                                                            <option value="Tashkent" title="Uzbekistan">Uzbekistan</option>
                                                            <option value="Port-Vila" title="Vanuatu">Vanuatu</option>
                                                            <option value="Vatican City" title="Vatican City">Vatican City</option>
                                                            <option value="Caracas" title="Venezuela">Venezuela</option>
                                                            <option value="Hanoi" title="Vietnam">Vietnam</option>
                                                            <option value="Road Town, Virgin Islands, British" title="Virgin Islands, British">Virgin Islands, British</option>
                                                            <option value="Charlotte Amalie" title="Virgin Islands, U.S.">Virgin Islands, U.S.</option>
                                                            <option value="Mata Utu" title="Wallis and Futuna">Wallis and Futuna</option>
                                                            <option value="El-Aaiún" title="Western Sahara">Western Sahara</option>
                                                            <option value="Sanaa" title="Yemen">Yemen</option>
                                                            <option value="Lusaka" title="Zambia">Zambia</option>
                                                            <option value="Harare" title="Zimbabwe">Zimbabwe</option>
                                                    </Select>
                                                    <small className="form-text text-muted text-danger">{countryChoice.error}</small>
                                                    {this.state.country !== "" &&(
                                                        <div>
                                                            <br/>
                                                            <input type="submit" className="btn btn-primary center-block" onClick={this.onContinueClick} value="Continue"/>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </fieldset>
                                </form>
                                <input type="button" className="btn btn-danger btn-xs pull-right" onClick={this.goBack} value="Go Back"/>
                            </div>
                        </div>
                    </div>
                    {this.state.redirectHome && (
                        <Redirect push to={{pathname: "/Home"}}/>
                    )}
                    {this.state.redirectError && (
                        <Redirect push to={{pathname: "/ErrorPage/" + this.state.errorValue}}/>
                    )}
                </div>
            </div>
        );
    }

}

export default AboutSite;