let db;

// opening database "BudgetDB" version "1"
const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore(
      "new_transaction", 
      { autoIncrement: true }
    );
};

request.onsuccess = function (event) {
    db = event.target.result;
    // Do something with request.result!
    if (navigator.onLine) {
        HandleTransaction();
    }
};

request.onerror = function (event) {
    // Do something with request.errorCode!
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    console.log("saving record");
    const transaction = db.transaction(
        ["new_transaction"], 
        "readwrite"
    );
    const TransStore = transaction.objectStore("new_transaction");
    TransStore.add(record);
}

function HandleTransaction() {
    const transaction = db.transaction(
        ["new_transaction"], 
        "readwrite"
    );
    const TransStore = transaction.objectStore("new_transaction");
    const getAll = TransStore.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
        fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(
                    ["new_transaction"], 
                    "readwrite"
                );
                const TransStore = transaction.objectStore("new_transaction");
                TransStore.clear();
                alert("Transactions Was Submitted Sucsessfully!");
            })
            .catch((err) => {
                console.log(err);
            });
        }
    };
};

window.addEventListener("online", HandleTransaction);