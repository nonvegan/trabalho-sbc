install.packages("RWeka")

library(RWeka)

pratos <- read.csv("pratos.csv", stringsAsFactors = TRUE)
pratos$fatores <- NULL
pratos$tipo_refeicao <- NULL
pratos_JRip <- JRip(prato_favorito ~ ., data = pratos,control = Weka_control(P=TRUE,N=1.0))

regras <- capture.output(pratos_JRip)

expressions_to_quote = list("menor18","maior18",
               "Masculino","Feminino",
               "Normal","Vegetariana","Vegan","GlutenFree",
               "Tradicional","FastFood","Italiana","Brasileira","Chinesa","Tailandesa","Indiana","Japonesa",
               "menos10","mais10"
               )

sink("regras.txt")
for (i in seq_along(regras)) {
  if(i>3 && i < length(regras)-3){
    x <- substring(regras[i],2,nchar(regras[i])-10)
    x <- gsub("[()\"]","",x)
    x <- gsub("=> ","then \'",x)
    x <- gsub("*=","",x)
    x <- gsub("tipo_comida|preco_maximo|idade|genero|tipo_alimentacao|prato_favorito","",x)
    for (y in seq_along(expressions_to_quote)){
      x <- gsub(expressions_to_quote[y],paste("\'",expressions_to_quote[y],"\'",sep=""),x)
    }
    x <- gsub("  +"," ",x)
    x <- trimws(x)
    writeLines(paste("if ",sep="",x,"\'."))
  }
}
ultima_regra <- regras[length(regras)-3]
writeLines(paste(sep="","else ","'",substring(ultima_regra,20,nchar(ultima_regra)-12),"'."))
sink()

shell("regras.txt")