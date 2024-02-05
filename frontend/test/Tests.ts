import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
const MINTER_ROLE = ethers.id("MINTER_ROLE");

describe.only("Contract tests", function () {
    async function deploymentFixture() {
        await network.provider.send("evm_setAutomine", [true]);

        const [owner, doctor, hospital, patient] = await ethers.getSigners();

        const prescriptionContract = await ethers.deployContract("PrescriptionTokens");

        await prescriptionContract.waitForDeployment();

        const appointmentContract = await ethers.deployContract("AppointmentTokens", [prescriptionContract.target]);

        await appointmentContract.waitForDeployment();

        return { prescriptionContract, appointmentContract, owner, doctor, hospital, patient };
    }

    describe.only("Deployment", function () {
        it("Deployer has default admin role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.hasRole(DEFAULT_ADMIN_ROLE, owner))
                .to.be.true;

            expect(await appointmentContract.hasRole(DEFAULT_ADMIN_ROLE, owner))
                .to.be.true;
        });

        it("Other role's admin is the default admin role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);

            expect(await appointmentContract.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        });
    });

    describe.only("Token name and symbol", function () {
        it("Token has correct name", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.name()).to.equal("Prescription");

            expect(await appointmentContract.name()).to.equal("Appointment");
        });

        it("Token has correct symbol", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.symbol()).to.equal("PRE");

            expect(await appointmentContract.symbol()).to.equal("APP");
        });
    });

    describe.only("Granting roles", function () {
        it("Should grant minter role correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.grantRole(MINTER_ROLE, doctor), "Should grant minter role to doctor")
                .to.emit(prescriptionContract, "RoleGranted").withArgs(MINTER_ROLE, doctor, owner);

            expect(await prescriptionContract.hasRole(MINTER_ROLE, doctor), "Doctor should now have minter role")
                .to.be.true;

            expect(await appointmentContract.grantRole(MINTER_ROLE, hospital), "Should grant minter role to hospital")
                .to.emit(appointmentContract, "RoleGranted").withArgs(MINTER_ROLE, hospital, owner);

            expect(await appointmentContract.hasRole(MINTER_ROLE, hospital), "Hospital should now have minter role")
                .to.be.true;
        });
        
        it("Should not grant minter role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await expect(prescriptionContract.connect(hospital).grantRole(MINTER_ROLE, doctor), 
                "Should not grant minter role to doctor")
                .to.be.revertedWithCustomError(prescriptionContract, "AccessControlUnauthorizedAccount")
                .withArgs(hospital, DEFAULT_ADMIN_ROLE);

            expect(await prescriptionContract.hasRole(MINTER_ROLE, doctor), "Doctor should not have minter role").to.be.false;

            await expect(appointmentContract.connect(doctor).grantRole(MINTER_ROLE, hospital), 
                "Should not grant minter role to hospital")
                .to.be.revertedWithCustomError(appointmentContract, "AccessControlUnauthorizedAccount")
                .withArgs(doctor, DEFAULT_ADMIN_ROLE);

            expect(await appointmentContract.hasRole(MINTER_ROLE, hospital), "Hospital should not have minter role").to.be.false;
        });
    });

    describe.only("Revoking roles", function () {
        it("Should revoke minter role correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await prescriptionContract.grantRole(MINTER_ROLE, doctor);

            await appointmentContract.grantRole(MINTER_ROLE, hospital);

            expect(await prescriptionContract.revokeRole(MINTER_ROLE, doctor), "Should revoke minter role from doctor")
                .to.emit(prescriptionContract, "RoleRevoked").withArgs(MINTER_ROLE, doctor, owner);

            expect(await prescriptionContract.hasRole(MINTER_ROLE, doctor), "Doctor should not have minter role anymore")
                .to.be.false;

            expect(await appointmentContract.revokeRole(MINTER_ROLE, hospital), "Should revoke minter role from hospital")
                .to.emit(appointmentContract, "RoleRevoked").withArgs(MINTER_ROLE, hospital, owner);

            expect(await appointmentContract.hasRole(MINTER_ROLE, hospital), "Hospital should not have minter role anymore")
                .to.be.false;
        });
        
        it("Should not revoke minter role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await prescriptionContract.grantRole(MINTER_ROLE, doctor);

            await appointmentContract.grantRole(MINTER_ROLE, hospital);

            await expect(prescriptionContract.connect(hospital).revokeRole(MINTER_ROLE, doctor), 
                "Should not revoke minter role from doctor")
                .to.be.revertedWithCustomError(prescriptionContract, "AccessControlUnauthorizedAccount")
                .withArgs(hospital, DEFAULT_ADMIN_ROLE);

            expect(await prescriptionContract.hasRole(MINTER_ROLE, doctor), "Doctor should still have minter role").to.be.true;

            await expect(appointmentContract.connect(doctor).revokeRole(MINTER_ROLE, hospital), 
                "Should not revoke minter role from hospital")
                .to.be.revertedWithCustomError(appointmentContract, "AccessControlUnauthorizedAccount")
                .withArgs(doctor, DEFAULT_ADMIN_ROLE);

            expect(await appointmentContract.hasRole(MINTER_ROLE, hospital), "Hospital shoul still have minter role").to.be.true;
        });
    });

    describe.only("Minting tokens", function () {
        it("Should mint prescription token correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await prescriptionContract.grantRole(MINTER_ROLE, doctor);

            expect(await prescriptionContract.connect(doctor).safeMint(patient, 1, 1), 
                "Should mint prescription token to patient")
                .to.emit(prescriptionContract, "MintedPrescription").withArgs(1, patient);

            expect(await prescriptionContract.ownerOf(1), "Patient should be now the owner of the prescription token")
                .to.equal(patient);
        });

        it("Should mint appointment token correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await appointmentContract.grantRole(MINTER_ROLE, hospital);

            expect(await appointmentContract.connect(hospital).safeMint(2, ethers.id(""), 1), 
                "Should mint appointment token to hospital")
                .to.emit(appointmentContract, "MintedAppointment").withArgs(2);

            expect(await appointmentContract.ownerOf(2), "Hospital should now be the owner of the appointment token")
                .to.equal(hospital);
        });

        it("Should not mint prescription token correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await expect(prescriptionContract.connect(doctor).safeMint(patient, 1, 1), 
                "Doctor should not be able to mint prescription without role")
                .to.be.revertedWithCustomError(prescriptionContract, "AccessControlUnauthorizedAccount")
                .withArgs(doctor, MINTER_ROLE);
        });

        it("Should not mint appointment token correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                doctor,
                hospital,
                patient
            } = await loadFixture(deploymentFixture);

            await expect(appointmentContract.connect(hospital).safeMint(2, ethers.id(""), 1), 
                "Hospital should not be able to mint appointment without role")
                .to.be.revertedWithCustomError(appointmentContract, "AccessControlUnauthorizedAccount")
                .withArgs(hospital, MINTER_ROLE);
        });
    });
});