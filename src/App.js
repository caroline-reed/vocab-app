import React from "react";
import "./index.css";

import vocabList from './eng_words_common.json';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fab, fas);

var todayObj = new Date();
var month = String(todayObj.getMonth());
var date = String(todayObj.getDate());
var loadIntervalId;

const months = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

const monthNames = Object.keys(months);
const monthVals = Object.values(months);



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // error: null,
      isLoaded: false,
      loadDisplay: 'block',
      loadMsg: 'Loading',
      dotCount: 0,
      displayDate: '',
      wordin: '',
      gotWord: '',
      gotPhon: '',
      gotAudio: '',
      gotPart: '',
      gotDef: '',
      gotExample: '',
      displayDaily: 'none',
      displaySearch: 'none',
      displayRandom: 'none',
      displaySearchBar: 'block',
      displaySearchResult: 'none',
    };

    this.getDailyVocab = this.getDailyVocab.bind(this);
    this.getWordSearch = this.getWordSearch.bind(this);
    this.getRandomVocab = this.getRandomVocab.bind(this);
  }

  async isLoading() {
    var wordWindows = document.getElementsByClassName("wordWindow");
    for (var i = 0; i < wordWindows.length; i++) {
      wordWindows[i].style.display = "none";
    }
    this.setState({
      loadDisplay: 'block'
    });
    loadIntervalId = setInterval(() => {
      if (this.state.dotCount < 3) {
        this.setState({
            loadMsg: this.state.loadMsg + ".",
            dotCount: this.state.dotCount + 1
        });
        // this.setState({
        //   loadMsg: this.state.loadMsg + "."
        // });
      } else if (this.state.dotCount === 3) {
        this.setState({
            loadMsg: "Loading",
            dotCount: 0
        });
      }

    }, 250);
  }

  async doneLoading() {
    console.log("Done loading");
    clearInterval(loadIntervalId);
    this.setState({
      loadMsg: 'Loading'
    })
  }


  async getDef(word) {
    await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
      .then(response => {
        if (response.status >= 300 && response.status < 600) {
          this.setState({loadMsg: 'Error loading definition, please try again'});
          return 1;
        }
        return response.json();
      })

      .then(defData => {
        console.log("DEFDATA", defData);
        // var exampleString = defData[0]['meanings'][0]['definitions'][0].example + " ";

        this.setState({
          gotWord: defData[0].word,
          gotPart: defData[0]['meanings'][0].partOfSpeech,
          gotDef: defData[0]['meanings'][0]['definitions'][0].definition,
        });
        if (defData[0].phonetic !== ['']) {
          this.setState({
            gotPhon: defData[0].phonetic,
            gotAudio: 'https:' + defData[0]['phonetics'][0].audio,
          })
        }
        if (defData[0]['meanings'][0]['definitions'][0].example) {
          var exampleString = defData[0]['meanings'][0]['definitions'][0].example;

          this.setState({
            gotExample: exampleString[0].toUpperCase() + exampleString.substring(1)
          });
        } else {
          this.setState({gotExample: ''});
        }
     });
  }


  async getDailyVocab() {
    this.isLoading();

    console.log('DailyVocab Called');
    console.log('VOCABLIST JSON', vocabList);

    var dWord = vocabList['2022'][month][monthNames[month]][0][date];
    console.log("dWord", dWord);

    let dailyRes = await this.getDef(dWord);
    if (dailyRes !== 1) {
      this.doneLoading();
      this.setState({loadDisplay: 'none'});
      this.getDailyWord();
    }
  }

  async getRandomVocab() {
    this.isLoading();

    let rmonth = Math.floor(Math.random() * 12);
    let rdate = Math.floor(Math.random() * monthVals[rmonth]);

    var rWord = vocabList['2022'][rmonth][monthNames[rmonth]][0][rdate];
    console.log("Randword", rWord);

    let randRes = await this.getDef(rWord);
    if (randRes !== 1) {
      this.doneLoading();
      this.setState({loadDisplay: 'none'});
      this.getRandomWord();
    } else {
      console.log("Word not found!")
    }
  }


  async getDailyWord() {
    var daynum = todayObj.getDay();
    var weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    var wkday = weekdays[daynum];

    var today_datetime = todayObj.toString();
    var today = today_datetime
      .substring(4, today_datetime.indexOf('2022') + 4)
      .replace(' 2022', ', 2022');

    var dateStr = wkday + ' ' + today;

    this.setState({
      loadDisplay: 'none',
      displayDaily: 'block',
      displayDate: dateStr,
      displaySearch: 'none',
      displayRandom: 'none'
    });

    var wordWindows = document.getElementsByClassName("wordWindow");
    wordWindows[0].style.display = "block";
    wordWindows[1].style.display = "none";
    wordWindows[2].style.display = "none";
  }


  async getWordSearch() {
    this.setState({
      loadDisplay: 'none',
      displayDaily: 'none',
      displaySearch: 'block',
      displayRandom: 'none',
      displaySearchBar: 'none',
      displaySearchResult: 'none'
    });

    var wordWindows = document.getElementsByClassName("wordWindow");
    wordWindows[0].style.display = "none";
    wordWindows[1].style.display = "block";
    wordWindows[2].style.display = "none";

    var sWord = prompt('Enter a word to search: ');

    this.isLoading();

    let searchRes = await this.getDef(sWord);
    if (searchRes !== 1) {
      this.doneLoading();
      this.setState({
        loadDisplay: 'none',
        displaySearchResult: 'block'
      });
      wordWindows[1].style.display = "block";

    }
    // <label for="wordSearch">Enter a word to search:</label>
    // <input id="wordSearch" type="text" value={this.state.wordin}
    //  onChange={this.getInput} name="wordSearch" />
    // <button id="submitSearch" type="button" name="wordSearch"
    // onClick={this.getDef(this.state.wordin)}>
    //   Search
    // </button>

  }


  async getRandomWord() {
    this.setState({
      loadDisplay: 'none',
      displayDaily: 'none',
      displaySearch: 'none',
      displayRandom: 'block'
    });

    var wordWindows = document.getElementsByClassName("wordWindow");
    wordWindows[0].style.display = "none";
    wordWindows[1].style.display = "none";
    wordWindows[2].style.display = "block";
  }


  async getInput(event) {
    this.setState({wordin: event.target.wordin})
  }


  async componentDidMount() {
    this.getDailyVocab();
  }


  render() {
    return (
      <div className="main">
        <section id="wordAppPage" className="container">
          <h1>Vocab Builder</h1>

          <section id="aboutWordApp">
            <h3>About</h3>
            <div id="appDefine" className="aboutWordSection">
              <p>This app provides daily  and randomized lessons on
                1000 of the most common English
                vocabulary words.
              </p>

              <p>You can also search the dictionary
                for definitions, pronunciations, and example sentences of
                thousands more words!
              </p>
            </div>

            <div id="appSpecs" className="aboutWordSection">
              <h4>Made With</h4>
              <ul>
                <li key="lang1"><FontAwesomeIcon icon={['fab', 'html5']} />{' '}HTML5</li>
                <li key="lang2"><FontAwesomeIcon icon={['fab', 'css3-alt']} />{' '}CSS3</li>
                <li key="lang3"><FontAwesomeIcon icon={['fab', 'react']} />{' '}React</li>
                <li key="lang4"><FontAwesomeIcon icon={['fas', 'book']} />{' '}
                  <a href="https://dictionaryapi.dev/">Free Dictionary API</a>
                </li>
              </ul>
            </div>
          </section>

          <section className="container" id="wordApp">
            <div className="container" id="wordAppHeader">
              <div id="wordAppTitle">
                <h2>Vocab Builder <FontAwesomeIcon icon="book-open" /></h2>
                <h3>Daily English Lessons | Dictionary Search</h3>
              </div>

              <div id="wordAppNav">
                <button
                  id="navButtonDaily" type="button" name="daily"
                  onClick={this.getDailyVocab}>
                  <FontAwesomeIcon icon="sun" />
                </button>

                <button
                  id="navButtonSearch" type="button" name="search"
                  onClick={this.getWordSearch}>
                  <FontAwesomeIcon icon="magnifying-glass" />
                </button>

                <button
                  id="navButtonRandom" type="button" name="random"
                  onClick={this.getRandomVocab}>
                  <FontAwesomeIcon icon="shuffle" />
                </button>
              </div>
            </div>

            <div className="container" id="displayWord">
              <div className="container" id="loadPage"
                style={{display: this.state.loadDisplay}}>
                {this.state.loadMsg}
              </div>

              <div id="windowDaily" className="container wordWindow"
                style={{display: this.state.displayDaily}}>
                <div className="container pageTitle">
                  <h4 id="date_today">{this.state.displayDate}</h4>

                </div>

                <p><b>{this.state.gotWord}</b>{"  "}(<i>{this.state.gotPart}</i>)</p>

                <p>[{this.state.gotPhon}]{"  "}
                <audio controls src={this.state.gotAudio} id="searchAudio" type="audio/mpeg">
                Your browser does not support HTML5 audio</audio></p>

                <p>{this.state.gotDef}</p>

                <p className="example"><i>{this.state.gotExample}</i></p>

                {/* <input type="file" name="file" id="file" /> */}
              </div>

              <div id="windowSearch" className="container wordWindow"
                style={{display: this.state.displaySearch}}>
                <div className="container pageTitle">
                  <h4>Dictionary Search</h4>
                </div>

                <div id="search_bar" style={{display: this.state.displaySearchBar}}>
                  <p>
                    If a search box does not appear, <br />
                    please disable your popup blocker to search the
                    dictionary.
                  </p>
                </div>

                <div id="search_result" style={{display: this.state.displaySearchResult}}>
                <p><b>{this.state.gotWord}</b>{"  "}(<i>{this.state.gotPart}</i>)</p>

                <p>[{this.state.gotPhon}]{"  "}
                <audio controls src={this.state.gotAudio} id="searchAudio" type="audio/mpeg">
                Your browser does not support HTML5 audio</audio></p>

                <p>{this.state.gotDef}</p>

                <p className="example"><i>{this.state.gotExample}</i></p>
                </div>
              </div>

              <div id="windowRandom" className="container wordWindow"
                style={{display: this.state.displayRandom}}>
                <div className="container pageTitle">
                  <h4>Random Word</h4>
                </div>

                <div className="container" id="randomResult">
                <p><b>{this.state.gotWord}</b>{"  "}(<i>{this.state.gotPart}</i>)</p>

                <p>[{this.state.gotPhon}]{"  "}
                <audio controls src={this.state.gotAudio} id="searchAudio" type="audio/mpeg">
                Your browser does not support HTML5 audio</audio></p>

                <p>{this.state.gotDef}</p>

                <p className="example"><i>{this.state.gotExample}</i></p>
                </div>
              </div>

              <div id="apiCred">
                <p>
                  Powered by{' '}
                  <a href="https://dictionaryapi.dev/">Free Dictionary API</a>
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}


export default App;
