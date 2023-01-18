import xapi from 'xapi';

// You can quickly create a developer instance at developer.service-now.com
const serviceNowInstance = 'dev71802';
const serviceNowUsername = 'admin';
const serviceNowPassword = 'z8lZ@h!X0FkO';
const serviceNowCaller_id = 'help';

// this will be added as css class to the body element of the web page
// allows you to customize the look and feel of the web dialog
const theme = 'disney';

// Bot token to send webex message when creating issue, create a bot user at developer.webex.com
const botToken = 'ZTI5NjhhZTYtNWExZS00OWZlLWIwMDUtZTRjYzlhNWFlZWE5MmNmZDEwZTMtMDIy_PF84_9ec7e2c9-c02c-424b-a4fb-2b568c0a1e74';

// Who to notify when creating the incident (webex email, eg dude@acme.com)
const notify = 'chris.blocher@withrove.com';

// change this if you want to host your own version of the Report Issue web page
const surveyUrl = 'https://chrisblocher55.github.io/roomos/report-issue/';

async function getSystemInfo() {
  const device = await xapi.Status.SystemUnit.ProductId.get();
  const serialNumber = await xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get();
  const software = await xapi.Status.SystemUnit.Software.DisplayName.get();
  const date = await xapi.Status.SystemUnit.Software.ReleaseDate.get();
  return `Type: ${device} Serial: ${serialNumber} Software: ${software} (${date})`;
}

async function getUrl() {
  const room = await xapi.Status.UserInterface.ContactInfo.Name.get();
  const device = await getSystemInfo();

  let url = surveyUrl;
  url += `?i=${serviceNowInstance}`;
  url += `&u=${serviceNowUsername}`;
  url += `&p=${serviceNowPassword}`;
  url += `&u=${serviceNowCaller_id}`;
  url += `&theme=${theme}`;
  url += `&roomname=${room}`;
  url += `&device=${device}`;
  url += `&webextoken=${botToken}`;
  url += `&notify=${notify}`;

  return url;
}

async function showSurvey() {
  const url = await getUrl();
  const target = await hasNavigator() ? 'Controller' : 'OSD';
  console.log('open', url, target);
  xapi.Command.UserInterface.WebView.Display({
    Url: url,
    Target: target,
    Mode: 'Modal',
  });
}

async function hasNavigator() {
  const peripherals = await xapi.Status.Peripherals.ConnectedDevice.get();
  return peripherals.some(device => device.Type === 'TouchPanel' && device.Name.includes('Navigator'));
}

function init() {
  hasNavigator();
  xapi.Event.UserInterface.Extensions.Panel.Clicked.on(e => {
    if (e.PanelId === 'report_issue') {
      showSurvey();
    }
  })
}

init();