const http = require('http');
const config = require('./config');
const url = require('url');

http.createServer((request, response) => {
  const pathname = url.parse(request.url).pathname;
  switch (pathname) {
    case '/':
      onGetRoot(request, response);
      break;
    case '/weather':
      onGetWeather(request, response);
      break;
    default:
      onGetDefault(request, response);
  }
}).listen(config.port);


function onGetRoot(request, response) {
  const template = `
    <h1>Home page</h1>
    <h3>Endpoints:</h3>
    <ui>
      <li>/weather?city=CITY_NAME - get current weather</li>
    </ui>
  `;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.statusCode = 200;
  response.write(template);
  response.end();
}

async function onGetWeather(request, response) {
  const searchParams = new url.URLSearchParams(url.parse(request.url).search);
  const city = searchParams.get('city');
  try {
    const data = await fetchWeather(city);
    const template = `
      <h1>Weather page</h1>
      <div>Name: ${data.location.name}</div>
      <div>Country: ${data.location.country}</div>
      <div>Temperature: ${data.current.temperature}</div>
      <div>Wind speed: ${data.current.wind_speed}</div>
      <div>Wind degree: ${data.current.wind_degree}</div>
      <div>Wind direction: ${data.current.wind_dir}</div>
      <div>Humidity: ${data.current.humidity}</div>
    `;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.statusCode = 200;
    response.write(template);
    response.end();
  } catch (error) {
    const template = `
      <h1>Weather page</h1>
      <div>${error}</div>
    `;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.statusCode = 200;
    response.write(template);
    response.end();
  }
}

function fetchWeather(city) {
  return new Promise((resolve, reject) => {
    if (!city) {
      reject(new Error('City undefined'));
    }
    const fullUrl = `${config.apiUrl}/current?access_key=${config.apiKey}&query=${city}`;
    http.get(fullUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error('Weather service unavailable'));
      }
      let data;
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const dataStartIdx = data.indexOf('{');
        const slicedData = data.slice(dataStartIdx);
        const parsedData = parseJson(slicedData);
        if (parsedData.current) {
          resolve(parsedData);
        } else {
          reject(new Error('Weather service unavailable'));
        }
      });
    });
  });
}

function onGetDefault(request, response) {
  const template = `<h1>Page not found</h1>`;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.statusCode = 401;
  response.write(template);
  response.end();
}

function parseJson(data) {
  try {
    return JSON.parse(data);
  } catch (error) {}
}
