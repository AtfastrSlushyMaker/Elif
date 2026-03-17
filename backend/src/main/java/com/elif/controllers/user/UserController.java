package com.elif.controllers.user;

import com.elif.entities.user.User;
import com.elif.services.user.IUserService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@AllArgsConstructor
public class UserController {

    final IUserService userService;

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
