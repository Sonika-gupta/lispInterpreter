(define twice (lambda (x) (* 2 x)))
(twice 5)
#10
(define repeat (lambda (f) (lambda (x) (f (f x)))))
((repeat twice) 10)
#40
((repeat (repeat twice)) 10)
#160
((repeat (repeat (repeat twice))) 10)
#2560
((repeat (repeat (repeat (repeat twice)))) 10)
#655360