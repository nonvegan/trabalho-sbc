:- dynamic fact/1.

:- op(800,fx,if).
:- op(700,xfx,then).
:- op(300,xfx,or).
:- op(200,xfy,and).


demo( P, Cert)  :- fact( P: Cert).
demo( Cond1 and Cond2, Cert)  :-
    demo( Cond1, Cert1), demo( Cond2, Cert2), Cert is min( Cert1, Cert2).
demo( Cond1 or Cond2, Cert)  :-
    demo( Cond1, Cert1), demo( Cond2, Cert2),    Cert is max( Cert1, Cert2).
demo( P, Cert)  :-
    if Cond then P : C1, demo( Cond, C2),    Cert is C1 * C2.
