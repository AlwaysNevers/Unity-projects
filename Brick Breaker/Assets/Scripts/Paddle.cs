using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Paddle : MonoBehaviour
{
    public new Rigidbody2D rigidbody;
    public Vector2 direction;
    public float speed = 10f;
    public bool gameStarted;
    public float maxBounceAngle = 75f;

    private void Awake()
    {
        rigidbody = gameObject.GetComponent<Rigidbody2D>();
    }

    private void Update() 
    {
        if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A))
        {
            direction = Vector3.left;
            gameStarted = true;
        } else if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D))
        {
            direction = Vector3.right;
            gameStarted = true;
        } else
        {
            direction = Vector3.zero;
        }
    }

    private void FixedUpdate() 
    {
        transform.Translate(direction * speed);
    }

    private void OnCollisionEnter2D(Collision2D collider)
    {
        Ball ball = collider.gameObject.GetComponent<Ball>();
        
        if (ball != null)
        {
            Rigidbody2D ballRigidBody = ball.GetComponent<Rigidbody2D>();
            
            Vector3 paddlePos = transform.position;
            Vector2 contactPoint = collider.GetContact(0).point;
            
            float offset = paddlePos.x - contactPoint.x;
            float length = collider.otherCollider.bounds.size.x / 2;

            // float currentAngle = Vector2.SignedAngle(Vector2.up, ballRigidBody.velocity);
            float bounceAngle = (offset / length) * maxBounceAngle;
            float newAngle = Mathf.Clamp(bounceAngle, -maxBounceAngle, maxBounceAngle);

            Quaternion rotation = Quaternion.AngleAxis(newAngle, Vector3.forward);
            ballRigidBody.velocity = rotation * Vector2.up * ballRigidBody.velocity.magnitude;

            if (offset > 0f)
            {
                ball.isRed = true;
            } else
            {
                ball.isRed = false;
            }
        }
    }
}
