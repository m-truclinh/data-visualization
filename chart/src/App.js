import React, { Component } from "react";
import "./App.css";

import { FirstLevel } from "./components/FirstLevel";
import { SecondLevel } from "./components/SecondLevel";
import { ActivityView } from "./components/ActivityView";
import { Legend } from "./components/Legend";
import { TimeLine } from "./components/Timeline";

class App extends Component {
  constructor() {
    super();
    this.data = undefined;
    this.filteredFirstLevelData = []; //the filtered data used in the first level chart
    this.filteredSecondLevelData = []; //the filtered data used in the second level chart
    this.activityArr = []; //the filtered data used in the activity view chart
    this.filteredTimelineData = []; //the filtered data used in the timeline chart
    this.subchapterCount = [9, 6, 3, 4, 6, 8, 7, 3, 3, 6, 3, 6, 5]; //Number of subchapters in each chapter
    this.state = {
      isOpened: false,
      openedChapter: -1,
      loading: true
    };
    this.toggleBox = this.toggleBox.bind(this);
  }

  componentDidMount() {
    // Add data
    fetch(
      "https://test.mumie.net/bp2018/public/api/ombplus/getUserAnswers?courseId=29&userId=69325"
    ) //69325
      .then(res => res.json()) //response type
      .then(json => {
        this.data = json;
        this.filterLevel1(json);
        this.filterLevel2(json);
        this.filterActivityView(json);
        this.filterTimeline(json);
        //
        this.setState({ loading: false });
      }); //log the data;
  }

  sortByChapterAndVersion = (a, b) => {
    return a.subchapter - b.subchapter || b.version - a.version; //sort according to subchapter first and then the versions
  };

  filterLevel1(data) {
    for (var i = 0; i < 13; i++) {
      //this goes through each of the chapter charts
      var kapitelFortschritt = {
        //we create this var and initiate it with starting values of 0.
        chapter: i + 1,
        progress: [
          { category: "0%", value: 0, full: 100 },
          { category: "0%", value: 0, full: 100 }
        ]
      };

      var tabelle = [45, 30, 15, 20, 31, 40, 39, 19, 15, 30, 15, 30, 25]; //each number is the sum of the trainings and quizes in its chapter

      data
        .filter(x => x.chapter === "" + (i + 1)) //filter needed chapter
        .sort(this.sortByChapterAndVersion) //sort according to subchapter first and then the versions
        .filter(
          //filter out to all except the last training/quiz in every subchapter
          (arr, index, self) =>
            index ===
            self.findIndex(
              t =>
                t.subchapter === arr.subchapter &&
                t.role === arr.role &&
                t.problem_nr === arr.problem_nr
            )
        )

        //create the new array
        .forEach(function(result) {
          if (result.role === "final_exam") {
            //if this object is a final exam
            let value = result.score * 100; //set the value to the new exam score
            kapitelFortschritt.progress[0].value = value; //set the new value to the kaptielfortschritts value
            let fixedValue = value.toLocaleString(undefined, {
              maximumFractionDigits: 2 //set the number of digits to just 2
            });
            kapitelFortschritt.progress[0].category = fixedValue + "%"; //set the new double digit data to the category of the category
          } else {
            //if it's a training or quiz
            let value = (kapitelFortschritt.progress[1].value += //we add all the T and Q to the value and divide by the according number from the tabelle array
              (result.score * 100) / tabelle[i]);
            kapitelFortschritt.progress[1].value = value;
            let fixedValue = value.toLocaleString(undefined, {
              maximumFractionDigits: 2 //set the number of digits to just 2
            });
            kapitelFortschritt.progress[1].category = fixedValue + "%"; //set the new double digit data to the category of the category
          }
          return result;
        });
      this.filteredFirstLevelData.push(kapitelFortschritt); //add the newly created chart data to filteredFirstLevelData
    }
  }

  filterLevel2(data) {
    for (var i = 0; i < 13; i++) {
      var endResult = []; //create endResult array to push later
      for (var j = 0; j < this.subchapterCount[i]; j++) {
        //we create for each chapter the correct count of subchapter with their values set to 0
        endResult.push({ subchapter: j + 1, training: 0, quiz: 0 });
      }
      if (i === 4 || i === 6 || i === 7) {
        //if we are in chapter 5,7 or 8 we create an extra one for the Kapiteltraining
        //add chapter trainings
        endResult.push({ subchapter: "Kapiteltraining", training: 0 });
      }
      data
        .filter(x => x.chapter === "" + (i + 1)) //filter needed chapter
        .filter(x => x.role === "quiz" || x.role === "training") //filter out final exams
        .sort(function(a, b) {
          //sort according so subchapter and in that according to highest score first
          return a.subchapter - b.subchapter || b.version - a.version;
        })
        .filter(
          //filter out to all except the best training/quiz in every subchapter
          (arr, index, self) =>
            index ===
            self.findIndex(
              t =>
                t.subchapter === arr.subchapter &&
                t.role === arr.role &&
                t.problem_nr === arr.problem_nr
            )
        )
        .map(function(result) {
          if (!result.subchapter)
            //if there is no subchapter we increase the subchapterCount by one
            result.subchapter = this.subchapterCount[i] + 1;
          var subs = endResult[result.subchapter - 1];
          var numOfTrainings = 4; //initiate the number of trainings in each subchapter with 4
          if (result.chapter === "7") {
            //if its chapter 7 subchapter 5 or 3 set the numOfTrainings to 3
            if (result.subchapter === "5" || result.subchapter === "3")
              numOfTrainings = 3;
            if (result.subchapter === "4" || result.subchapter === "7")
              //if its chapter 7 subchapter 4 or 7 set the numOfTrainings to 5
              numOfTrainings = 5;
          }
          if (result.role === "quiz") {
            //if the role is Quiz  set the quiz to the score
            subs.quiz = result.score * 100;
          } else {
            if (result.subchapter === 0 && result.chapter === "5") {
              numOfTrainings = 1;
            }
            subs.training += (result.score * 100) / numOfTrainings; //add all trainings to each other and devide by the numOfTrainings
          }
          return result;
        });
      this.filteredSecondLevelData.push(endResult); //add the newly created chart data to filteredSecondLevelData
    }
  }

  //Activity view
  filterActivityView(data) {
    function timeConverter(UNIX_timestamp) {
      //turn the UNIX_timestamp to a date
      var a = new Date(UNIX_timestamp);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var time = date + " " + month + " " + year;
      return time;
    }

    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    let now = new Date();

    var currentMonth = now.getMonth(); //get the Month
    var currentYear = now.getFullYear(); //get the Year

    for (var i = currentMonth - 2; i < currentMonth + 1; i++) {
      var current = new Date();
      current.setMonth(i); //get the last 3 months
      let year = i < 0 ? currentYear - 1 : currentYear;
      for (var j = 1; j < 32; j++) {
        //for loop day
        let dateString = year + "-" + (current.getMonth() + 1) + "-" + j; //if j.current.getmonth.year gueltig ist
        var dateToCheck = new Date(dateString);
        if (dateToCheck.getMonth() === current.getMonth()) {
            //push to the activityArr the newly listed day month and value
            this.activityArr.push({
                day: "" + j,
                month: months[current.getMonth()] + " " + year,
                value: 0
            });
        }
      }
    }

    let that = this;

    data
      .sort(function(a, b) {
        //sort by scores
        return a.score - b.score;
      })
      .sort(function(a, b) {
        //sort data by timestamp
        return (
          timeConverter(a.timestamp).split(" ")[0] -
          timeConverter(b.timestamp).split(" ")[0]
        );
      })

      .forEach(function(result) {
        var date = timeConverter(result.timestamp).split(" ");
        var temp = that.activityArr.find(element => {
          return (
            element.day === date[0].toString() &&
            element.month === date[1] + " " + date[2]
          );
        });
        if (!temp) return; //ignorieren  falls Daten nicht aus der letzten 3 Monate sind
        if (!temp.value) temp.value = 0; //if temp.value is undefined set it to zero.
        temp.value++;
        return result;
      });
  }

  /**
   * Converts a timestamp to YYYY-MM-DD
   * @param {*} timestamp
   */
  timestampToYYYYMMDD(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    if (month.length < 2) month = "0" + month;
    date = date.getDate().toString();
    if (date.length < 2) date = "0" + date;
    return year + "-" + month + "-" + date;
  }

  filterTimeline(data) {
    let filteredList = [];
    let dailyScores = [];

    data
      .map(entry => {
        //Converts a timestamp to YYYY-MM-DD
        entry.date = this.timestampToYYYYMMDD(entry.timestamp);
        return entry;
      })

      .forEach(entry => {
        let lastVersion = filteredList.find(entry2 => {
          //find the corresponding entry and entry 2 data
          return (
            entry.date === entry2.date &&
            entry.chapter === entry2.chapter &&
            entry.role === entry2.role &&
            entry.subchapter === entry2.subchapter &&
            entry.problem_nr === entry2.problem_nr
          );
        });
        if (!lastVersion) {
          //if it's not the last version, push that entry into the filtered list
          filteredList.push(entry);
        } else {
          //otherwise check to see if the last version is smaller then the entry version
          if (lastVersion.version < entry.version) {
            lastVersion.version = entry.version; //set the entry version and score to the last version ones
            lastVersion.score = entry.score;
          }
        }
      });

    filteredList.forEach(entry => {
      //now use the filteredList to create the final data list
      let currentScore = dailyScores.find(entry2 => {
        return entry.date === entry2.date;
      });
      if (!currentScore) {
        //if there is no currentScore push the new date and value to the dailyScores
        dailyScores.push({ date: entry.date, value: entry.score });
      } else {
        //otherwise add the entry score to the currentScore value
        currentScore.value += entry.score;
      }
    });

    dailyScores = dailyScores.sort((entry1, entry2) => {
      return entry1.date < entry2.date ? -1 : 1;
    });

    let oldValue = 0;
    dailyScores.forEach(entry => {
      //here we rewrite the old value.
      entry.improvedResult = entry.value; //set a new improved result and add the old one to the oldValue
      entry.value = oldValue;
      oldValue = entry.value + entry.improvedResult;
    });
    this.filteredTimelineData = dailyScores;
  }

  toggleBox(chapter) {
    //toggle box to show the subchapter results
    this.setState({
      isOpened: !this.state.isOpened,
      openedChapter: chapter
    });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.loading ? (
          //Spinner loading sign
          <div>
            <div className="spinner" />
            <br />
            <h3 id="spinner-text">Daten werden geladen...</h3>
          </div>
        ) : (
          <div className="App">
            <div id="go-back">
              <a href={"https://test.mumie.net/bp2018/link/Start"}>
                Zurück zum Kurs
              </a>
            </div>
            <br />
            <br />

            <div>
              <h1>Kapitelübersicht</h1>
              <h4>
                Die Übersicht der Lernfortschritte für alle 10 Kapitel und 3
                Zusatzmodule.
              </h4>
              <Legend />
            </div>

            <div className="tenChapter">
              <div
                id="One"
                onClick={() => this.toggleBox("1")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "1"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"1"} data={this.filteredFirstLevelData[0]} />
              </div>

              <div
                id="Two"
                onClick={() => this.toggleBox("2")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "2"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"2"} data={this.filteredFirstLevelData[1]} />
              </div>

              <div
                id="Three"
                onClick={() => this.toggleBox("3")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "3"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"3"} data={this.filteredFirstLevelData[2]} />
              </div>

              <div
                id="Four"
                onClick={() => this.toggleBox("4")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "4"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"4"} data={this.filteredFirstLevelData[3]} />
              </div>

              <div
                id="Five"
                onClick={() => this.toggleBox("5")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "5"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"5"} data={this.filteredFirstLevelData[4]} />
              </div>

              <div
                id="Six"
                onClick={() => this.toggleBox("6")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "6"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"6"} data={this.filteredFirstLevelData[5]} />
              </div>

              <div
                id="Seven"
                onClick={() => this.toggleBox("7")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "7"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"7"} data={this.filteredFirstLevelData[6]} />
              </div>

              <div
                id="Eight"
                onClick={() => this.toggleBox("8")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "8"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"8"} data={this.filteredFirstLevelData[7]} />
              </div>

              <div
                id="Nine"
                onClick={() => this.toggleBox("9")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "9"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"9"} data={this.filteredFirstLevelData[8]} />
              </div>

              <div
                id="Ten"
                onClick={() => this.toggleBox("10")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "10"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"10"} data={this.filteredFirstLevelData[9]} />
              </div>
            </div>

            <div className="additionalChapter">
              <h3>Zusatzmodule</h3>
              <div
                id="Eleven"
                onClick={() => this.toggleBox("11")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "11"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"11"} data={this.filteredFirstLevelData[10]} />
              </div>

              <div
                id="Twelve"
                onClick={() => this.toggleBox("12")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "12"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"12"} data={this.filteredFirstLevelData[11]} />
              </div>

              <div
                id="Thirteen"
                onClick={() => this.toggleBox("13")}
                style={{
                  display:
                    !this.state.isOpened || this.state.openedChapter === "13"
                      ? "inline-block"
                      : "none"
                }}
              >
                <FirstLevel id={"13"} data={this.filteredFirstLevelData[12]} />
              </div>
            </div>

            {this.state.isOpened && <SecondLevel /> && (
              <div>
                <h2>Abschnittsübersicht</h2>
                <h4>
                  Die Leistungsdaten aus jedem Abschnitt der ausgewählten
                  Kapitel.
                </h4>

                <SecondLevel
                  id={this.state.openedChapter}
                  data={
                    this.filteredSecondLevelData[this.state.openedChapter - 1]
                  }
                />
              </div>
            )}
            <div>
              <h1>Aktivitätübersicht</h1>
              <h4>
                Die tägliche Bearbeitung der Aufgaben in der lezten drei
                Monaten.
              </h4>
              <ActivityView data={this.activityArr} />
            </div>
            <div>
              <h1>Timeline</h1>
              <h4>
                Darstellung des gesamten Leistungsfortschritts.
              </h4>
              <TimeLine data={this.filteredTimelineData} />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default App;
