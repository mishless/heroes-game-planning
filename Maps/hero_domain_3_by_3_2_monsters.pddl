;; Heroes of Might and Magic PDDL Domain - inspired by Jon Van Caneghem

(define (domain heroes-world)
   (:requirements :strips :typing)
   (:types hero location m0 m1 m2 m3 m4 w0 w1 w2 w3 w4)

  (:predicates  (at ?o - object ?l - location)		;; Position of an object
                (adjacent ?l1 ?l2 - location)		;; Whether two locations are connected
                (guarded ?l - location)			;; Whether the location is guarded
                (has-t0 ?h - hero)			;; Hero armed with weapon t0
                (has-t1 ?h - hero)			;; Hero armed with weapon t1
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
)
