:- dynamic(fact/1).
:- [backward,forward,proof,basedados].


if 'Brasileira' and 'menos10' then 'Salada de bifum'.
if 'FastFood' and 'maior18' and 'Masculino' then 'Big Mac'.
if 'Japonesa' and 'maior18' then 'Kare'.
if 'Indiana' and 'Feminino' then 'Arroz pulao'.
if 'FastFood' and 'maior18' then 'Amburguer'.
if 'Italiana' and 'Vegetariana' then 'Massa carbonara vegetariana'.
if 'Chinesa' and 'Feminino' then 'Pin em japA'.
if 'Italiana' and 'Vegan' then 'Macarrao vegano'.
if 'Italiana' then 'Massa'.
if 'Tradicional' then 'Feijoada a transmontana'.
if 'Chinesa' then 'Suchi'.
if 'Indiana' then 'Couve flor indiana'.
if 'Vegan' and 'maior18' then 'Dobradinha de linguiça vegana'.
if 'FastFood' and 'Feminino' then 'Francesinha sem gluten'.
if 'Vegetariana' and 'Tailandesa' and 'Masculino' then 'Sanduiche de bringela e tomata'.
if 'Japonesa' then 'Sushi salmao'.
if 'Vegan' then 'Pizza vegan'.
if 'menor18' then 'Pizza'.
fact(true).
if true then 'Picanha'.

res(Y):- fact(X).
res(_).

pratos(Y):- demo, findall(Y,res(Y),L1), list_to_set(L1,P).










