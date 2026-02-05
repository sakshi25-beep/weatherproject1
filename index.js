const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAcessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
//Kaam: Yahan hum HTML elements ko JavaScript mein "select" kar rahe hain taaki hum unpar action le sakein (jaise click hone par kya ho).
//intially variables

let currentTab=userTab;
const API_KEY="123f69ce1b7c92dfb19b7e36ec72d3ae";
currentTab.classList.add("current-tab");
//kaam: currentTab track karta hai ki abhi aap kaunse page par ho. By default, hum "Your Weather" (userTab) par hote hain, isliye usme current-tab class add karke usko highlight kar dete hain.

//ek kaam
function switchTab(clickedTab){
    if(clickedTab !=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        //Kaam: Agar aapne dusre tab par click kiya, toh purane tab se highlight (current-tab class) hata do aur naye tab par laga do.
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //Kaam: Agar aap "Search Weather" tab par aaye ho, toh weather info aur grant location wala box chhupa do aur Search Form dikha do.
        else{
            //main pehle search wale tab pr tha ab your weather tab visible karna h
            searchForm.classList.remove("active");
             userInfoContainer.classList.remove("active");
             //ab main your weather tab me aagya hu toh weather bhi display karna padega so lets check local storage for cordinates if we have saved them there
             getFromSessionStorage();
        }
    }
}
userTab.addEventListener("click",()=>{
//pass clicked tab as input parameter
switchTab(userTab);
} );
searchTab.addEventListener("click",()=>{
//pass clicked tab as input parameter
switchTab(searchTab);
});
//check if cordinates are already present in session storage
function getFromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local cordinates nahi mile
        grantAcessContainer.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
//kaam: Jab bhi aap "Your Weather" par aate ho, ye function check karta hai: "Kya mere paas pehle se location save hai?"
//Agar Nahi, toh "Grant Location" wala button dikhao.
//Agar Haan, toh data nikaalo aur weather fetch karo.
//iske baad api se data lana h

async function fetchUserWeatherInfo(cordinates){
    const{lat,lon}=cordinates;
    //make grantcontainer invisible
    grantAcessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");
    //Kaam: async matlab ye function background mein kaam karega. Pehle location box hatao aur Loading spinner dikhao
    //api call
    try{
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  
  const data= await response.json();
  loadingScreen.classList.remove("active");
  userInfoContainer.classList.add("active");
  renderWeatherInfo(data);
  //Kaam: fetch API server ko call karti hai. Jab data aa jata hai, loading spinner hata kar Weather Info wala box dikha diya jata hai.
    }
    catch(err)
{
//hw
loadingScreen.classList.remove("active");
    }
}
    function renderWeatherInfo(weatherInfo){
        //firstly we have to fetch the elements
        const cityName=document.querySelector("[data-cityName]");
        const countryIcon=document.querySelector("[data-countryIcon]");
        const desc=document.querySelector("[data-weatherDesc]");
        const weatherIcon=document.querySelector("[data-weatherIcon]");
        const temp=document.querySelector("[data-temp]");
        const windspeed =document.querySelector("[data-windspeed]");
        const humidity=document.querySelector("[data-humidity]");
        const cloudiness= document.querySelector("[data-cloudiness]");
        //fetch value from weatherInfo object put it ui elements
        // 2. Reflect values from weatherInfo object into UI
    // Note: Use optional chaining (?.) to prevent errors if data is missing
    cityName.innerText = weatherInfo?.name;
    
    // Get country flag using lowercase country code
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    
    // Get weather icon from OpenWeather assets
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    }

//Kaam: API se jo weatherInfo (JSON) mila hai, usme se ek-ek cheez nikaal kar HTML elements mein daal do. Jaise weatherInfo.name se city ka naam mil jayega.
function getLocation(){
    if( navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //hw
        alert("geolocation is not supported by this browser");
    }
}
//Kaam: Browser se permission mangta hai ki "Kya hum aapki location dekh sakte hain?"

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
//Kaam: Agar user ne "Allow" kiya, toh latitude aur longitude mil jayenge. Unhe hum browser ki memory (sessionStorage) mein save kar dete hain taaki baar-baar permission na mangni pade.
const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput=document.querySelector("[data-searchInput]");
//Kaam: Jab aap search box mein city likh kar "Enter" maarte ho, toh ye function us city ka naam uthata hai aur fetchSearchWeatherInfo ko call karta hai.

searchForm.addEventListener("submit",(e) =>{
 e.preventDefault();
 let cityName=searchInput.value;
 if( cityName=== "")
    return;
else
    fetchSearchWeatherInfo(cityName);
})
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");
    try {
        const response = await fetch( 
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
           //agr response sahi nhi hai
            if(!response.ok){
               throw new Error("city not found");
                }


        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        // Handle error here
        loadingScreen.classList.remove("active");
    alert("City not found. Please try again!");
    }
}