demo:- new_derived_fact( P), !,            % A new fact
    write( 'Derived: '), write( P), nl,
    assert( fact( P)),
    demo.                             % Continue
demo:- write( 'No more facts').

new_derived_fact( Concl)  :-
    if Cond then Concl,
    \+ fact( Concl),
    composed_fact( Cond).

 composed_fact( Cond)  :-
 fact( Cond).
composed_fact( Cond1 and Cond2)  :-
composed_fact( Cond1),
composed_fact( Cond2).
composed_fact( Cond1 or Cond2)  :-
composed_fact( Cond1)
;
composed_fact( Cond2).
