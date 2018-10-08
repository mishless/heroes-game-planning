;; Heroes of Might and Magic PDDL Domain - inspired by Jon Van Caneghem

(define (domain heroes-world)
   (:requirements :strips :typing)
   (:types hero location monster weapon - object
	m0 m1 m2 m3 m4 - monster
	w0 w1 w2 w3 w4 - weapon)

  (:predicates  (at ?o - object ?l - location)		;; Position of an object
                (adjacent ?l1 ?l2 - location)		;; Whether two locations are connected
                (guarded ?l - location)			;; Whether the location is guarded
                (has-t0 ?h - hero)			;; Hero armed with weapon t0
                (has-t1 ?h - hero)			;; Hero armed with weapon t1
                (has-t3 ?h - hero)			;; Hero armed with weapon t3
                (has-t4 ?h - hero)			;; Hero armed with weapon t4
                (has-t5 ?h - hero)			;; Hero armed with weapon t5
		(has-castle ?l - location)		;; Gets the castle at position l

  )

   (:action move
      :parameters (?h - hero ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (adjacent ?l1 ?l2) (not (guarded ?l2)))
      :effect (and (at ?h ?l2) (not (at ?h ?l1)))
   )

   (:action kill-m0
      :parameters (?h - hero ?m - m0 ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-t0 ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)) (has-castle ?l2))
   )

   (:action kill-m1
      :parameters (?h - hero ?m - m1 ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-t1 ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)) (has-castle ?l2))
   )

   (:action kill-m2
      :parameters (?h - hero ?m - m2 ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-t2 ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)) (has-castle ?l2))
   )

   (:action kill-m3
      :parameters (?h - hero ?m - m3 ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-t3 ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)) (has-castle ?l2))
   )

   (:action kill-m4
      :parameters (?h - hero ?m - m4 ?l1 - location ?l2 - location)
      :precondition (and (at ?h ?l1) (at ?m ?l2) (adjacent ?l1 ?l2) (guarded ?l2) 
			(has-t4 ?h))
      :effect (and(not (at ?m ?l2)) (not (guarded ?l2)) (at ?h ?l2) (not (at ?h ?l1)) (has-castle ?l2))
   )

   (:action collect-w0
      :parameters (?h - hero ?w - w0 ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-t0 ?h) (not (at ?w ?l1)))
   )

   (:action collect-w1
      :parameters (?h - hero ?w - w1 ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-t1 ?h) (not (at ?w ?l1)))
   )

   (:action collect-w2
      :parameters (?h - hero ?w - w2 ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-t2 ?h) (not (at ?w ?l1)))
   )

   (:action collect-w3
      :parameters (?h - hero ?w - w3 ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-t3 ?h) (not (at ?w ?l1)))
   )

   (:action collect-w4
      :parameters (?h - hero ?w - w4 ?l1 - location)
      :precondition (and (at ?h ?l1) (at ?w ?l1))
      :effect (and (has-t4 ?h) (not (at ?w ?l1)))
   )
)
