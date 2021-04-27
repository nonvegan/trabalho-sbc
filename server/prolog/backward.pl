:-  op( 800, fx, if).
:-  op( 700, xfx, then).
:-  op( 300, xfy, or).
:-  op( 200, xfy, and).
demo( Q)  :-
fact( Q).
demo( Q)  :-
    if Condition then Q, % A relevant rule
    demo( Condition). % whose condition is true
demo( Q1 and Q2)  :-
    demo( Q1),
    demo( Q2).
demo( Q1 or Q2)  :-
    demo( Q1);
    demo( Q2).
