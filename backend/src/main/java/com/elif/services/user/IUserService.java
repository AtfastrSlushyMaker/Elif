package com.elif.services.user;

import com.elif.entities.user.User;

import java.util.List;

public interface IUserService {
    User addOrUpdateUser(User user);

    void deleteUser(Long idUser);

    List<User> findAllUsers();

    User findUser(Long idUser);
}
