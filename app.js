const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'covid19India.db')
let db = null

const initialization = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB erroe:${e.message}`)
    process.exit(1)
  }
}

initialization()

const convertStateDb = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const convertDistrict = dbObject => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbobject.cured,
    active: dbObject.active,
    deaths: dbObjects.deaths,
  }
}

app.get('/states', async (request, response) => {
  const getstates = `
SELECT 
* 
FROM 
state
ORDER BY
state_id;`
  const api1 = await db.all(getstates)
  response.send(api1.map(i => convertStateDb(i)))
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getsatesId = `
  SELECT 
    * 
  FROM 
    state
  WHERE 
    state_id = ${stateId};`
  const api2 = await db.get(getsatesId)
  response.send(convertStateDb(api2))
})

app.post('/districts/', async (request, response) => {
  const details = request.body
  const {districtName, stateId, cases, cured, active, deaths} = details
  const postQuery = `
INSERT INTO
district(district_name,state_id,cases,cured,active,deaths)
VALUES
('${districtName}',${stateId},${cases},${cured},${active},${deaths});`
  await db.run(postQuery)
  response.send('District Successfully Added')
})

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtsQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${districtId};`
  const api4 = await db.get(districtsQuery)
  response.send(convertDistrict(api4))
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = `
DELETE
FROM
district
WHERE
district_id = ${districtId};`
  await db.run(deleteQuery)
  response.send('District Removed')
})

app.put('/districts/:districtId', async (request, response) => {
  const {districtId} = request.params
  const detail = request.body
  const {districtName, stateId, cases, cured, active, deaths} = detail

  const districtsUpdate = `
UPDATE
district
SET
district_name = '${districtName}',
state_id = ${stateId},
cases = ${cases},
cured = ${cured},
active = ${active},
deaths = ${deaths}
WHERE 
district_id = ${districtId};`

  await db.run(districtsUpdate)
  response.send('District Details Updated')
})

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const total = `
SELECT
SUM(cases) as totalCase,
SUM(cured) as totalCured,
SUM(active) as totalActive,
SUM(deaths) as totalDeaths
FROM
district
WHERE
state_id = ${stateId};`

  const sumArray = await db.get(total)
  response.send(sumArray)
})

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const stateNames = `
       select state_name as stateName from district
       where district_id = ${districtId};`

  const api = await db.get(stateNames)
  response.send(api)
})

module.exports = app
