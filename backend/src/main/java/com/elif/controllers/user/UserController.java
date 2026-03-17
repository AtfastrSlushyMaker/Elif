package com.elif.controllers.user;

import com.elif.dto.user.LoginRequest;
import com.elif.dto.user.RegisterRequest;
import com.elif.dto.user.UserResponse;
import com.elif.entities.user.User;
import com.elif.services.user.IUserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@AllArgsConstructor
public class UserController {

    final IUserService userService;

    @PostMapping("/register")
    ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(userService.register(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add")
    User addUser(@RequestBody User user) {
        return userService.addOrUpdateUser(user);
    }

    @PutMapping("/update")
    User updateUser(@RequestBody User user) {
        return userService.addOrUpdateUser(user);
    }

    @DeleteMapping("/delete")
    void deleteUser(@RequestParam Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/findAll")
    List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/findById/{idUser}")
    User findByIdUser(@PathVariable Long idUser) {
        return userService.findUser(idUser);
    }
}
