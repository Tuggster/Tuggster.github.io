let teacherList;
let scheduleList;
loadCSV().then(studentList => {
  teacherList = parseData(studentList);
  scheduleList = studentList;
  // console.log(teacherList);
  // console.log(studentList);
  // console.log(getPeriodsByTeacher(teacherList, "David Mejia"));
  teacherChange();
});

async function loadCSV() {
  const response = await fetch('where.csv');
  const data = await response.text();
  return Papa.parse(data);
}

function containsIdentical(list, teacher, period) {
  for (let i = 1; i < list.length; i++) {
    //console.log(teacher, period);
    if (list[i].teacher == teacher && list[i].period == period) {
      return true;
    }
  }
  return false;
}

function parseData(list) {
  let len = list.data.length;
  let teachers = new Array();

  for (let i = 1; i < len; i++) {
    let row = list.data[i];
    for (let j = 1; j < row.length; j++) {
      let teacher = row[j];
      if (teacher != '') {
        if (!containsIdentical(teachers, teacher, j)) {
          // console.log(i, j, len, teacher, j);
          let cl = {
            teacher: teacher,
            period: j
          };
          // console.log(j);
          teachers.push(cl);
          // if (j == 1) {
          //    console.log(cl.teacher);
          // }
        }
      }
    }
    if (i == 200) {
      break;
    }
  }
  teachers.sort((a, b) => (a.teacher > b.teacher) ? 1 : -1)
  let tList = new Array();

  for (let i = 0; i < teachers.length; i++) {
    if (!tList.includes(teachers[i].teacher)) {
      document.getElementById('teacher').innerHTML += `<option value="${teachers[i].teacher}">${teachers[i].teacher}</option>`
      tList.push(teachers[i].teacher);
    }
  }

  return teachers;
}

function teacherChange() {
  let teacher = document.getElementById('teacher').value;
  let periods = getPeriodsByTeacher(teacherList, teacher);
  // console.log(periods);
  let periodDropdown = document.getElementById('period');
  periodDropdown.innerHTML = "";
  for (let i = 0; i < periods.length; i++) {
    periodDropdown.innerHTML += `<option value="${periods[i]}">${periods[i]}</option>`;
  }

  periodChange();
}

function showAllView(list, t, btn) {


  if (btn) {
    var ddl = document.getElementById('teacher');
    var opts = ddl.options.length;
    for (var i=0; i<opts; i++){
        if (ddl.options[i].value == t){
            ddl.options[i].selected = true;
            break;
        }
    }

    var ddl = document.getElementById('period');
    var opts = ddl.options.length;
    for (var i=0; i<opts; i++){
        if (ddl.options[i].value == "All"){
            ddl.options[i].selected = true;
            break;
        }
    }
  }

  let clHeader = document.getElementById('clHeader');
  clHeader.innerHTML = `${t}'s Day</p>`

  let periods = getPeriodsByTeacher(teacherList, t);

  let stuTab = document.getElementById("studentTable");
  stuTab.innerHTML = "";
  let row = stuTab.insertRow();
  let stuCount = new Array();
  let maxStu = 0;

  console.log(periods)
  for (let i = 0; i < periods.length - 1; i++) {
    // console.log(`<p onclick="loadStudentSchedule('${students[i]}')">${students[i]}</p>`);
    row.insertCell().innerHTML = `${periods[i]}`;

    students = getStudentByClass(teacherList, t, periods[i]);
    console.log(students);
    stuCount.push(students);
    if (students.length >= maxStu) maxStu = students.length;
  }

  for (let i = 0; i < maxStu; i++) {
    row = stuTab.insertRow();
    for (let j = 0; j < periods.length - 1; j++) {
      if (i < stuCount[j].length) {
        row.insertCell().innerHTML = `<p onclick="loadStudentSchedule(scheduleList, '${stuCount[j][i]}')">${stuCount[j][i]}</p>`;;
      } else {
        row.insertCell().innerHTML = "";
      }
    }
  }
}

function periodChange() {
  let p = document.getElementById('period').value;
  let t = document.getElementById('teacher').value;
  let students;
  if (p != "All") {
    students = getStudentByClass(teacherList, t, p);

    let clHeader = document.getElementById('clHeader');
    clHeader.innerHTML = `${t}'s Period ${p} <p style="color:red">(${students.length} students) ${students.length > 10 ? "10 randoms highlighted." : "Not enough to select students."}</p>`

    let stuTab = document.getElementById("studentTable");
    stuTab.innerHTML = "";

    for (let i = 0; i < students.length; i++) {
      let row = stuTab.insertRow();
      // console.log(`<p onclick="loadStudentSchedule('${students[i]}')">${students[i]}</p>`);
      row.insertCell().innerHTML = `<p onclick="loadStudentSchedule(scheduleList, '${students[i]}')">${students[i]}</p>`;
    }

    if (students.length > 10) {
      let rand = new Array();
      for (let i = 0; i < 10; i++) {
        let r = Math.floor(Math.random() * students.length);
        while (rand.includes(r)) {
          r = Math.floor(Math.random() * students.length);
        }
        rand.push(r);
        stuTab.rows[r].cells[0].style.color = "red"
      }
    }
  } else {
    showAllView(teacherList, t)
  }
}

function loadStudentSchedule(list, student) {
  let schedule = list.data.find(e => (e[0] == student))

  let clHeader = document.getElementById('clHeader');
  clHeader.innerHTML = `${student}'s schedule <button onclick="periodChange()">Go Back</button>`

  let stuTab = document.getElementById("studentTable");
  stuTab.innerHTML = "";

  let row = stuTab.insertRow();
  for (let i = 1; i < schedule.length; i++) {
    row.insertCell().innerHTML = i;
  }

  row = stuTab.insertRow();
  for (let i = 1; i < schedule.length; i++) {
    row.insertCell().innerHTML = `<p onclick="showAllView(scheduleList, '${schedule[i]}', true)">${schedule[i]}</p>`;
  }
}

function getPeriodsByTeacher(list, teacher) {
  let periods = new Array();
  periods.push("All");
  for (let i = 0; i < list.length; i++) {
    if (list[i].teacher == teacher) {
      periods.push(list[i].period);
    }
  }
  periods.sort((a, b) => (a > b) ? 1 : -1);
  return periods;
}

function getStudentByClass(list, teacher, period) {
  let cl = list.find(e => (e.teacher == teacher && e.period == period))
  let students = new Array();

  for (let i = 1; i < scheduleList.data.length; i++) {
    for (let j = 1; j < scheduleList.data[i].length; j++) {
      if (scheduleList.data[i][j] == cl.teacher && j == cl.period) {
        students.push(scheduleList.data[i][0]);
      }
    }
  }
  return students;
}
