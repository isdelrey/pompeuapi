import Errors from './Errors'
import he from'he';

const ENDPOINT ='https://secretariavirtual.upf.edu/cosmos/Controlador/?apl=Uninavs&gu=a&idNav=inicio&NuevaSesionUsuario=true&NombreUsuarioAlumno=ALUMNO&responsive=S'

/* Available pages to crawl */
var pages = {}
pages.login = (async ({browser, tab}, official_id, birthdate) => {
            await tab.goTo(ENDPOINT)
            console.log('> Endpoint')
            await tab.type('input[name="idUsuario"]', official_id)
            await tab.type('input[name="password"]', birthdate)
            await tab.click('a[onclick="lanzarUrlLogin()"]')
            await tab.waitForPageToLoad()
            let evaluation = await tab.evaluate(() => document.getElementsByClassName('tiles-midnightblue').length)
            if(evaluation.result.value == 0) {
                browser.close()
                throw {
                    why: Errors.LOGIN_FAILS
                }
            }
            console.log('> Login OK')
})
pages.name = (async ({browser, tab}) => {
    let capitalize = string => {
        return string
            .toLowerCase()
            .split(' ')
            .map(word =>
                (["de","del","von","van"].indexOf(word) < 0) ? word.charAt(0).toUpperCase() + word.slice(1) : word
            )
            .join(' ')
            .trim();
    }
    let evaluation = await tab.evaluate(() => unescape(document.getElementsByClassName("username")[0].innerText))
    return capitalize(evaluation.result.value)
})
pages.menu = (async ({browser, tab}) => {
            await tab.click('a.tiles-midnightblue')
            await tab.waitForPageToLoad()
            await tab.waitForPageToLoad()
})
pages.imageschedule = (async ({browser, tab}) => {
            await tab.click('a[onclick="javascript:buscar();"]')
            await tab.waitForSelectorToLoad('#calendar')
            await tab.wait(600)
            let evaluation = await tab.evaluate(() => {
                let element = document.querySelector(".fc-view.fc-view-agendaWeek.fc-agenda")
                element.classList.remove("fc-view")
                element.style.overflow = "visible"
                element.style.height = "auto"
                element.style.overflowY = "visible"
            })
            const image = await tab.getScreenshot({
                selector: '#calendar .fc-content',
                format: 'jpg',
                quality: 100
            }, false)
            console.log('✓ Visual')
            return image
})
pages.rawschedule = (async ({browser, tab}) => {
            let start = new Date()
            start = new Date(start.setDate(start.getDate() - start.getDay() + (start.getDay() == 0 ? -6:1))).getTime();
            start -= start % 86400000
            let end = start + 604800000
            console.log(start)
            await tab.goTo(`https://secretariavirtual.upf.edu/pds/control/[Ajax]selecionarRangoHorarios?rnd=1677.0&start=${start/1000}&end=${end/1000}`)
            console.log('✓ Raw data')
            let evaluation = await tab.evaluate(() => unescape(document.documentElement.innerText))
            let data = JSON.parse(evaluation.result.value)
            for(let i = 0; i < data.length; i++) {
                data[i].start = Date.parse(data[i].start)
                data[i].end = Date.parse(data[i].end)
                if(data[i].hasOwnProperty("title"))
                data[i].title = he.decode(data[i].title)
                if(data[i].hasOwnProperty("tipologia"))
                    data[i].tipologia = he.decode(data[i].tipologia)
                if(data[i].hasOwnProperty("comentario"))
                    data[i].comentario = he.decode(data[i].comentario)
                if(data[i].hasOwnProperty("observacion"))
                    data[i].observacion = he.decode(data[i].observacion)
                delete data[i].publicarComentario
                delete data[i].estaRepartido
                delete data[i].profesores
                delete data[i].fusionado
                delete data[i].ocultarAula
                delete data[i].ocultarDescTipologia
                delete data[i].publicarObservacion
                delete data[i].reseId
                delete data[i].className
                delete data[i].descAsignatura
                delete data[i].codPlan
            }
            console.log('> Parsed')
            return data
})

export default pages