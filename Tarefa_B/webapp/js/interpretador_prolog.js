export { consult, consultFile, query, queryF, assertz, retractall };

function consult(rule, session) {
  session.consult(
    `
    ${rule}
  `,
    {
      success: () => console.log("success"),
      error: (err) => console.log(err),
    }
  );
}

function consultFile(file, session) {
  session.consult(file, {
    success: () => console.log("success"),
    error: (err) => console.log(err),
  });
}

function query(q, session, callback) {
  session.query(q);
  session.answer({
    success: callback,
    error: (err) => console.log(err),
    fail: () => console.log("fail"),
    limit: () => console.log("limit exceeded"),
  });
}

function queryF(q, session, callback, failcallBack) {
  session.query(q);
  session.answer({
    success: callback,
    error: (err) => console.log(err),
    fail: failcallBack,
    limit: () => console.log("limit exceeded"),
  });
}

function assertz(term, session) {
  session.query(`assertz(${term}).`);
  session.answer({
    error: (err) => console.log(err),
    fail: () => console.log("fail"),
    limit: () => console.log("limit exceeded"),
  });
}

function retractall(head, session) {
  session.query(`retractall(${head}).`);
  session.answer({
    error: (err) => console.log(err),
    fail: () => console.log("fail"),
    limit: () => console.log("limit exceeded"),
  });
}
