document.addEventListener("DOMContentLoaded", function(){
  let dateForm = document.getElementById("date-form");
  let checkboxForm = document.getElementById("checkbox-form");
  let date = "";

  dateForm.addEventListener("submit", function()
  {

    let checkboxForm = document.getElementById("checkbox-form");

    // First clear previous checkboxes
    let first = checkboxForm.firstElementChild;
    while (first)
    {
      first.remove();
      first = checkboxForm.firstElementChild;
    }

    date = document.getElementById("date-input").value;
    // yyy-mm-dd, split
    let dateArray = date.split("-");
    let yyyy = Number(dateArray[0]);
    let mm = Number(dateArray[1]);
    let dd = Number(dateArray[2]);

    // Loop make checkboxes, for event in event_list where yyyy==....
    for (const event of event_list)
    {
      // Make checkbox for each event on that day
      if (yyyy == event["year"] && mm == event["month"] && dd == event["day"])
      {
        const formCheckDiv = document.createElement("div");
        formCheckDiv.setAttribute("class", "form-check");
        const checkInput = document.createElement("input");
        checkInput.setAttribute("class", "form-check-input");
        checkInput.setAttribute("type", "checkbox");
        checkInput.setAttribute("value", event["id"]);
        checkInput.setAttribute("name", "checkbox");
        checkInput.setAttribute("id", event["id"]);
        const checkLabel = document.createElement("label");
        checkLabel.setAttribute("class", "form-check-label");
        checkLabel.setAttribute("for", event["id"]);

        formCheckDiv.appendChild(checkInput);
        formCheckDiv.appendChild(checkLabel);
        checkboxForm.appendChild(formCheckDiv);
        checkLabel.innerHTML = event["event"];
      }
    }
    // Make submit button if there are checkboxes
    if (checkboxForm.innerHTML.length != 0)
    {
      const checkSubmit = document.createElement("button");
      checkSubmit.setAttribute("type", "submit");
      checkSubmit.setAttribute("class", "btn btn-primary");
      checkSubmit.setAttribute("id", "delete-selected");
      checkboxForm.appendChild(checkSubmit);
      checkSubmit.innerText = "Delete selected events";
    }
    else {
      const element = document.createElement("p");
      element.innerText = "No event";
      checkboxForm.appendChild(element);
    }

  });

});
