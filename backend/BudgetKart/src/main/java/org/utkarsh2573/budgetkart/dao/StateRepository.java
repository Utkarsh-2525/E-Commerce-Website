package org.utkarsh2573.budgetkart.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.utkarsh2573.budgetkart.entity.State;

import java.util.List;

@RepositoryRestResource
public interface StateRepository extends JpaRepository<State,Integer>
{
    List<State> findByCountryCode(@Param("code") String code);
}
